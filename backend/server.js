const express = require('express');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const loki = require('lokijs');
const TraitEngine = require('./trait-engine');
const DogeInscriber = require('./doge-inscriber');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const COLLECTIONS_ROOT = path.join(__dirname, 'data/collections');

// ─── Security ──────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://cryptologos.cc", "https://api.dicebear.com"],
      connectSrc: ["'self'", "http://localhost:4001"],
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS — restrict to known origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4000,http://localhost:4001').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('CORS not allowed'));
  },
  credentials: true,
}));

// Rate limiting — prevent brute force
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  message: { error: 'Too many requests, slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Aggressive rate limit on sensitive endpoints
const shuffleLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  message: { error: 'Shuffle rate limit reached. Try again in a moment.' },
});

const mintLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Mint rate limit reached.' },
});

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1hr
  max: 10,
  message: { error: 'Collection creation limit reached.'},
});

// Serve trait images as static files (with cache headers)
app.use('/assets/collections', express.static(COLLECTIONS_ROOT, {
  maxAge: '1h',
  etag: true,
  lastModified: true,
}));

// Body parsing with size limit
app.use(express.json({ limit: '1mb' }));

// Session — strong secret (use env var in production)
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false, // Don't create sessions for unauthenticated users
  name: 'lm.sid', // Custom cookie name (hides Express)
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Prevent XSS access to cookies
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }
}));

// ─── Database ──────────────────────────────────────────────────
const DB_DIR = path.join(__dirname, 'db');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new loki(path.join(DB_DIR, 'lazy-minter.json'), {
  autoload: true,
  autosave: true, 
  autosaveInterval: 4000
});

let users, mints;
db.loadDatabase({}, () => {
  users = db.getCollection('users') || db.addCollection('users', { unique: ['userId'] });
  mints = db.getCollection('mints') || db.addCollection('mints');
});

// ─── Input sanitization ────────────────────────────────────────
const sanitize = (str, maxLen = 100) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>'"&]/g, '').trim().slice(0, maxLen);
};

// ─── Collection Engine ─────────────────────────────────────────

const getEngine = (collectionId) => {
  const safeId = sanitize(collectionId, 50).replace(/[^a-z0-9-]/g, '');
  const dir = path.join(COLLECTIONS_ROOT, safeId);
  if (!fs.existsSync(dir)) throw new Error('Collection not found');
  return new TraitEngine(dir);
};

// Default collection
let currentCollectionId = 'doge-punk';
let engine = getEngine(currentCollectionId);
const inscriber = new DogeInscriber({ rpcUrl: process.env.DOGE_RPC_URL });

// ─── API Routes ────────────────────────────────────────────────

// List all collections
app.get('/api/collections', (req, res) => {
  try {
    const folders = fs.readdirSync(COLLECTIONS_ROOT);
    const infoList = folders.map(folder => {
      const infoPath = path.join(COLLECTIONS_ROOT, folder, 'info.json');
      if (fs.existsSync(infoPath)) {
        return JSON.parse(fs.readFileSync(infoPath, 'utf8'));
      }
      return null;
    }).filter(Boolean);
    res.json(infoList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load collections' });
  }
});

// Current collection info
app.get('/api/collection/info', (req, res) => {
  try {
    const infoPath = path.join(engine.collectionDir, 'info.json');
    const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
    res.json({ ...info, categories: engine.categories, traitMetadata: engine.traitMetadata });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load collection info' });
  }
});

// Get trait image paths
app.get('/api/collection/trait-images', (req, res) => {
  try {
    const images = {};
    for (const [category, traits] of Object.entries(engine.traitMetadata)) {
      images[category] = {};
      for (const [name, meta] of Object.entries(traits)) {
        images[category][name] = `/assets/collections/${currentCollectionId}/${meta.imagePath}`;
      }
    }
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load trait images' });
  }
});

// Switch collection
app.post('/api/collection/switch', (req, res) => {
  const { collectionId } = req.body;
  if (!collectionId) return res.status(400).json({ error: 'collectionId required' });
  try {
    engine = getEngine(collectionId);
    currentCollectionId = collectionId;
    res.json({ success: true, collectionId });
  } catch (err) {
    res.status(404).json({ error: 'Collection not found' });
  }
});

// ─── User middleware ───────────────────────────────────────────
const ensureUser = (req, res, next) => {
  if (!req.session.userId) {
    req.session.userId = crypto.randomBytes(12).toString('hex');
  }
  let user = users?.findOne({ userId: req.session.userId });
  if (!user) {
    user = users?.insert({ userId: req.session.userId, credits: 5, totalMinted: 0 }); 
  }
  if (!user) return res.status(500).json({ error: 'Database not ready' });
  req.user = user;
  next();
};

// Session
app.get('/api/session', ensureUser, (req, res) => {
  res.json({ 
    userId: req.user.userId, 
    credits: req.user.credits,
    username: req.user.username || null,
    walletAddress: req.user.walletAddress || null,
    totalMinted: req.user.totalMinted || 0
  });
});

// Update profile
app.post('/api/user/profile', ensureUser, (req, res) => {
  const username = sanitize(req.body.username, 30);
  const walletAddress = sanitize(req.body.walletAddress, 80);
  req.user.username = username;
  req.user.walletAddress = walletAddress;
  users.update(req.user);
  res.json({ success: true });
});

// Create collection
app.post('/api/collections', createLimiter, ensureUser, (req, res) => {
  const name = sanitize(req.body.name, 50);
  const symbol = sanitize(req.body.symbol, 10).toUpperCase();
  const description = sanitize(req.body.description, 500);

  if (!name || !symbol) return res.status(400).json({ error: 'Name and symbol are required' });

  const collectionId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const collectionDir = path.join(COLLECTIONS_ROOT, collectionId);
  
  try {
    if (fs.existsSync(collectionDir)) {
      return res.status(409).json({ error: 'Collection already exists' });
    }
    fs.mkdirSync(collectionDir, { recursive: true });
    fs.mkdirSync(path.join(collectionDir, 'traits'), { recursive: true });
    
    fs.writeFileSync(path.join(collectionDir, 'info.json'), JSON.stringify({
      id: collectionId, name, symbol, description
    }, null, 2));

    res.json({ success: true, collectionId, name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Gallery
app.get('/api/mints', ensureUser, (req, res) => {
  const userMints = mints.find({ userId: req.user.userId });
  res.json(userMints);
});

// Leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const topUsers = users.chain()
      .find({ totalMinted: { $gt: 0 } })
      .simplesort('totalMinted', true)
      .limit(25)
      .data();
    res.json(topUsers.map(u => ({ 
      userId: u.userId, 
      username: u.username || null,
      totalMinted: u.totalMinted || 0 
    })));
  } catch (err) {
    res.json([]);
  }
});

// Shuffle
app.post('/api/shuffle', shuffleLimiter, ensureUser, (req, res) => {
  // Free shuffle — no credit check needed
  
  const { lockedTraits } = req.body;
  
  // Validate lockedTraits
  const safeLocked = {};
  if (lockedTraits && typeof lockedTraits === 'object') {
    for (const [k, v] of Object.entries(lockedTraits)) {
      if (engine.categories[k] && engine.categories[k].includes(v)) {
        safeLocked[k] = v;
      }
    }
  }

  const newTraits = engine.shuffle(safeLocked);
  const traitHash = engine.computeTraitHash(newTraits);
  const rarityInfo = engine.getRarityInfo(newTraits);
  
  // No credit deduction
  // req.user.credits--;
  // users.update(req.user);

  res.json({
    traits: newTraits,
    traitHash,
    rarityInfo,
    credits: req.user.credits,
  });
});

// Purchase credits
app.post('/api/purchase-credits', ensureUser, (req, res) => {
  const { txid } = req.body;
  if (!txid || typeof txid !== 'string') return res.status(400).json({ error: 'Invalid txid' });
  // TODO: Real DOGE payment verification
  req.user.credits += 10;
  users.update(req.user);
  res.json({ success: true, credits: req.user.credits });
});

// Mint
app.post('/api/mint-doge', mintLimiter, ensureUser, async (req, res) => {
  const { userAddress, traitHash, txid, traits } = req.body;
  
  if (!userAddress || !traitHash || !txid || !traits) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const isValid = await inscriber.verifyPayment(txid, 100); 
    if (!isValid) return res.status(400).json({ error: 'Invalid payment' });

    const result = await inscriber.inscribe(userAddress, traitHash, traits);
    
    if (result.success) {
      mints.insert({
        userId: req.user.userId,
        inscriptionId: result.inscriptionId,
        traits,
        traitHash,
        mintedAt: new Date().toISOString()
      });

      req.user.totalMinted = (req.user.totalMinted || 0) + 1;
      users.update(req.user);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Mint failed' });
  }
});

// ─── Serve Frontend Build in Production ────────────────────────
const FRONTEND_BUILD = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(FRONTEND_BUILD)) {
  app.use(express.static(FRONTEND_BUILD));
  // SPA fallback — all non-API routes serve index.html
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/assets')) return next();
    res.sendFile(path.join(FRONTEND_BUILD, 'index.html'));
  });
}

// ─── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 4001;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Lazy Minter API running on http://${HOST}:${PORT}`);
});
