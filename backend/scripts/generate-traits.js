#!/usr/bin/env node
/**
 * Generate SVG trait images and JSON metadata for the Doge Punk collection.
 * Run: node scripts/generate-traits.js
 */
const fs = require('fs');
const path = require('path');

const COLLECTION_DIR = path.join(__dirname, '..', 'data', 'collections', 'doge-punk');
const TRAITS_DIR = path.join(COLLECTION_DIR, 'traits');

// Trait definitions: category -> [{ name, color/style info }]
const TRAITS = {
  Background: [
    { name: 'New Punk Blue', colors: ['#e5e7eb', '#3b82f6', '#1e40af'] },
    { name: 'Orange',        colors: ['#fff7ed', '#fdba74', '#ea580c'] },
    { name: 'Purple',        colors: ['#faf5ff', '#d8b4fe', '#7e22ce'] },
    { name: 'Army Green',    colors: ['#f0fdf4', '#86efac', '#15803d'] },
    { name: 'Aquamarine',    colors: ['#ecfeff', '#67e8f9', '#0e7490'] },
    { name: 'Gray',          colors: ['#f3f4f6', '#9ca3af', '#4b5563'] },
    { name: 'Yellow',        colors: ['#fefce8', '#fde047', '#a16207'] },
  ],
  Fur: [
    { name: 'Brown',         color: '#8d5524' },
    { name: 'Golden',        color: '#e6c645' },
    { name: 'Dark Brown',    color: '#3e2723' },
    { name: 'Black',         color: '#212121' },
    { name: 'Cream',         color: '#f5f5dc' },
    { name: 'Robot',         color: '#b0bec5', texture: 'metal' },
    { name: 'Zombie',        color: '#6b8e4e', texture: 'rotting' },
    { name: 'Trippy',        color: '#ff4081', texture: 'psychedelic' },
  ],
  Eyes: [
    { name: 'Bored',         variant: 'bored' },
    { name: 'Bloodshot',     variant: 'bloodshot' },
    { name: 'Sleepy',        variant: 'sleepy' },
    { name: '3D Glasses',    variant: '3d' },
    { name: 'Crazy',         variant: 'crazy' },
    { name: 'Sunglasses',    variant: 'shades' },
    { name: 'Robot',         variant: 'robot' },
    { name: 'Coins',         variant: 'coins' },
  ],
  Mouth: [
    { name: 'Bored',         variant: 'bored' },
    { name: 'Grin',          variant: 'grin' },
    { name: 'Cigar',         variant: 'cigar' },
    { name: 'Pizza',         variant: 'pizza' },
    { name: 'Rage',          variant: 'rage' },
    { name: 'Bubblegum',     variant: 'gum' },
  ],
  Hat: [
    { name: 'None',          variant: 'none' },
    { name: 'Beanie',        variant: 'beanie', color: '#ff5722' },
    { name: 'Captain Hat',   variant: 'captain', color: '#fff' },
    { name: 'Cowboy Hat',    variant: 'cowboy', color: '#795548' },
    { name: 'Party Hat',     variant: 'party', color: '#00bcd4' },
    { name: 'Fez',           variant: 'fez', color: '#d32f2f' },
    { name: 'Halo',          variant: 'halo', color: '#ffeb3b' },
  ],
  Clothes: [
    { name: 'None',          variant: 'none' },
    { name: 'Tuxedo',        variant: 'tux', color: '#000' },
    { name: 'Hoodie',        variant: 'hoodie', color: '#9e9e9e' },
    { name: 'Hawaii Shirt',  variant: 'hawaii', color: '#ff9800' },
    { name: 'Lab Coat',      variant: 'lab', color: '#fff' },
    { name: 'Bone Tee',      variant: 'bone', color: '#000' },
    { name: 'Prison Jumpsuit', variant: 'prison', color: '#ff9800' },
  ],
  Neck: [
    { name: 'None',          variant: 'none' },
    { name: 'Gold Chain',    variant: 'gold', color: '#ffc107' },
    { name: 'Silver Chain',  variant: 'silver', color: '#e0e0e0' },
  ]
};

// Rarity tiers based on count within category
function getRarity(index, total) {
  const ratio = index / total;
  if (ratio < 0.15) return { tier: 'Legendary', weight: 2 };
  if (ratio < 0.35) return { tier: 'Rare', weight: 5 };
  if (ratio < 0.60) return { tier: 'Uncommon', weight: 15 };
  return { tier: 'Common', weight: 30 };
}

// SVG generators per category

function generateBackgroundSVG(trait) {
  const [c1, c2, c3] = trait.colors;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${c2}"/>
</svg>`;
}

function generateFurSVG(trait) {
  // Bored Ape shape: rounded head, distinct snout, ear bump
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <filter id="f1" x="0" y="0" width="200%" height="200%">
      <feOffset result="offOut" in="SourceAlpha" dx="2" dy="2" />
      <feGaussianBlur result="blurOut" in="offOut" stdDeviation="2" />
      <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
    </filter>
  </defs>
  <!-- Shoulders/Body -->
  <path d="M140,400 Q256,380 372,400 L372,512 L140,512 Z" fill="${trait.color}" filter="url(#f1)"/>
  <!-- Neck -->
  <rect x="220" y="320" width="72" height="100" fill="${trait.color}" filter="url(#f1)"/>
  <!-- Head Base -->
  <circle cx="256" cy="240" r="95" fill="${trait.color}" filter="url(#f1)"/>
  <!-- Snout Area -->
  <ellipse cx="276" cy="285" rx="55" ry="40" fill="#d7ccc8" filter="url(#f1)"/> 
  <!-- Ear Left -->
  <circle cx="155" cy="240" r="25" fill="${trait.color}" filter="url(#f1)"/>
  <!-- Ear Detail -->
  <circle cx="155" cy="240" r="12" fill="#d7ccc8" opacity="0.6"/>
</svg>`;
}

function generateEyesSVG(trait) {
  let content = '';
  // Default eye position
  const ly = 215, ry = 215, lx = 225, rx = 285;
  
  if (trait.variant === 'bored') {
    content = `
    <!-- Whites -->
    <circle cx="${lx}" cy="${ly}" r="22" fill="white" stroke="#000" stroke-width="2"/>
    <circle cx="${rx}" cy="${ry}" r="22" fill="white" stroke="#000" stroke-width="2"/>
    <!-- Pupils - heavy lids -->
    <circle cx="${lx}" cy="${ly}" r="6" fill="#000"/>
    <circle cx="${rx}" cy="${ry}" r="6" fill="#000"/>
    <!-- Eyelids -->
    <path d="M${lx-22},${ly-10} Q${lx},${ly} ${lx+22},${ly-10}" fill="#d7ccc8" stroke="#000" stroke-width="1"/>
    <path d="M${rx-22},${ry-10} Q${rx},${ry} ${rx+22},${ry-10}" fill="#d7ccc8" stroke="#000" stroke-width="1"/>
    `;
  } else if (trait.variant === '3d') {
    content = `
    <rect x="${lx-25}" y="${ly-15}" width="110" height="40" rx="5" fill="none" stroke="#000" stroke-width="4"/>
    <rect x="${lx-20}" y="${ly-10}" width="40" height="30" fill="rgba(255,0,0,0.5)"/>
    <rect x="${rx-20}" y="${ry-10}" width="40" height="30" fill="rgba(0,0,255,0.5)"/>
    `;
  } else if (trait.variant === 'shades') {
    content = `
    <path d="M190,200 L320,200 L310,240 L280,240 L256,210 L232,240 L200,240 Z" fill="#111"/>
    <line x1="160" y1="210" x2="190" y2="210" stroke="#111" stroke-width="4"/>
    `;
  } else {
     // Normal/Crazy
    content = `
    <circle cx="${lx}" cy="${ly}" r="22" fill="white" stroke="#000"/>
    <circle cx="${rx}" cy="${ry}" r="22" fill="white" stroke="#000"/>
    <circle cx="${lx}" cy="${ly}" r="8" fill="#000"/>
    <circle cx="${rx+5}" cy="${ry-5}" r="4" fill="#000"/>
    `;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${content}</svg>`;
}

function generateMouthSVG(trait) {
  let content = '';
  // Snout pos is cx=276, cy=285. Mouth should be around 300
  if (trait.variant === 'bored') {
    content = `<path d="M250,305 L310,305" stroke="#000" stroke-width="4" stroke-linecap="round"/>`;
  } else if (trait.variant === 'grin') {
    content = `
      <path d="M250,295 Q280,325 310,295" fill="white" stroke="#000" stroke-width="2"/>
      <path d="M250,295 Q280,325 310,295" fill="none" stroke="#000" stroke-width="2"/>
      <line x1="280" y1="295" x2="280" y2="315" stroke="#000" stroke-width="1"/>
    `;
  } else if (trait.variant === 'cigar') {
    content = `
      <rect x="280" y="300" width="60" height="12" fill="#5d4037" transform="rotate(-10 280 300)"/>
      <circle cx="280" cy="305" r="8" fill="#3e2723"/>
      <circle cx="340" cy="290" r="4" fill="#ef5350"/>
      <path d="M345,285 Q355,270 345,260" stroke="#9e9e9e" stroke-width="2" fill="none"/>
    `;
  } else if (trait.variant === 'pizza') {
    content = `
    <path d="M260,305 L320,305 L290,360 Z" fill="#ffecb3" stroke="#fbc02d"/>
    <circle cx="280" cy="315" r="3" fill="#e53935"/>
    <circle cx="300" cy="330" r="3" fill="#e53935"/>
    `;
  } else {
    content = `<path d="M250,310 Q280,290 310,310" stroke="#000" stroke-width="4" fill="none"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${content}</svg>`;
}

function generateHatSVG(trait) {
  if (trait.variant === 'none') return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"></svg>`;
  
  let content = '';
  // Head top roughly cy=145
  if (trait.variant === 'beanie') {
    content = `
      <path d="M190,160 Q256,100 322,160" fill="${trait.color}"/>
      <rect x="185" y="155" width="142" height="20" rx="5" fill="${trait.color}"/>
    `;
  } else if (trait.variant === 'captain') {
    content = `
      <path d="M180,150 L332,150 L320,100 L192,100 Z" fill="white" stroke="#000" stroke-width="2"/>
      <rect x="170" y="145" width="172" height="15" fill="#000"/>
      <circle cx="256" cy="120" r="10" fill="#ffd700"/>
    `;
  } else if (trait.variant === 'halo') {
    content = `
      <ellipse cx="256" cy="110" rx="60" ry="10" fill="none" stroke="${trait.color}" stroke-width="6"/>
    `;
  } else if (trait.variant === 'cowboy') {
    content = `
      <ellipse cx="256" cy="150" rx="100" ry="20" fill="#5d4037"/>
      <path d="M206,150 Q210,90 256,90 Q302,90 306,150" fill="#5d4037"/>
    `;
  } else {
    // Fez or Party
    content = `
      <path d="M220,150 L230,100 L282,100 L292,150 Z" fill="${trait.color}"/>
    `;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${content}</svg>`;
}

function generateClothesSVG(trait) {
  if (trait.variant === 'none') return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"></svg>`;
  
  let content = '';
  if (trait.variant === 'tux') {
    content = `
      <path d="M150,420 L256,440 L362,420 L362,512 L150,512 Z" fill="#000"/>
      <path d="M256,440 L256,512" stroke="white" stroke-width="2"/>
      <polygon points="256,450 240,430 272,430" fill="black"/>
    `;
  } else if (trait.variant === 'hoodie') {
    content = `
      <path d="M150,420 Q256,400 362,420 L362,512 L150,512 Z" fill="${trait.color}"/>
      <circle cx="256" cy="450" r="40" fill="rgba(0,0,0,0.2)"/> 
    `;
  } else {
    // Hawaii, Lab, Prison, etc
    content = `
      <path d="M150,420 Q256,400 362,420 L362,512 L150,512 Z" fill="${trait.color}"/>
      <path d="M256,420 L256,512" stroke="rgba(0,0,0,0.2)" stroke-width="2"/>
    `;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${content}</svg>`;
}

function generateNeckSVG(trait) {
  if (trait.variant === 'none') return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"></svg>`;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <path d="M220,380 Q256,420 292,380" stroke="${trait.color}" stroke-width="5" fill="none"/>
    <circle cx="256" cy="410" r="8" fill="${trait.color}" stroke="#000" stroke-width="1"/>
  </svg>`;
}

const generators = {
  Background: generateBackgroundSVG,
  Fur: generateFurSVG,
  Eyes: generateEyesSVG,
  Mouth: generateMouthSVG,
  Hat: generateHatSVG,
  Clothes: generateClothesSVG,
  Neck: generateNeckSVG,
};

// Main generation
console.log('🎨 Generating Solana Punk trait assets...\n');

let totalTraits = 0;
const collectionMetadata = { traits: {} };

for (const [category, traits] of Object.entries(TRAITS)) {
  const catDir = path.join(TRAITS_DIR, category);
  fs.mkdirSync(catDir, { recursive: true });
  
  // Remove old .txt files
  const existing = fs.readdirSync(catDir);
  existing.forEach(f => {
    if (f.endsWith('.txt')) fs.unlinkSync(path.join(catDir, f));
  });

  collectionMetadata.traits[category] = [];
  const generator = generators[category];

  traits.forEach((trait, index) => {
    const rarity = getRarity(index, traits.length);
    const safeName = trait.name.replace(/\s+/g, '_');

    // Generate SVG image
    const svgContent = generator(trait);
    const svgPath = path.join(catDir, `${safeName}.svg`);
    fs.writeFileSync(svgPath, svgContent);

    // Generate JSON metadata
    const metadata = {
      name: trait.name,
      category,
      rarity: rarity.tier,
      weight: rarity.weight,
      image: `${safeName}.svg`,
      attributes: {
        ...trait,
        name: undefined,
      }
    };
    delete metadata.attributes.name;
    
    const jsonPath = path.join(catDir, `${safeName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));

    collectionMetadata.traits[category].push({
      name: trait.name,
      rarity: rarity.tier,
      weight: rarity.weight,
      image: `traits/${category}/${safeName}.svg`
    });

    totalTraits++;
  });

  console.log(`  ✅ ${category}: ${traits.length} traits generated`);
}

// Update collection info.json
const infoPath = path.join(COLLECTION_DIR, 'info.json');
const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
info.traitCount = totalTraits;
info.categories = Object.keys(TRAITS);
info.rarityTiers = ['Legendary', 'Rare', 'Uncommon', 'Common'];
fs.writeFileSync(infoPath, JSON.stringify(info, null, 2));

// Write full collection metadata
const metaPath = path.join(COLLECTION_DIR, 'metadata.json');
fs.writeFileSync(metaPath, JSON.stringify(collectionMetadata, null, 2));

console.log(`\n🚀 Done! Generated ${totalTraits} total traits with SVG images and JSON metadata.`);
console.log(`📂 Output: ${TRAITS_DIR}`);
