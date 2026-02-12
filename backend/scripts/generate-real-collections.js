const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '../data/collections');

// SVG helpers
const svg = (w, h, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n${content}\n</svg>`;
const pathEl = (d, fill, extra = '') => `  <path d="${d}" fill="${fill}" ${extra}/>`;
const grad = (id, colors, type = 'linear', props = {}) => {
  if (type === 'radial') {
    return `  <defs><radialGradient id="${id}" cx="${props.cx || '50%'}" cy="${props.cy || '50%'}" r="${props.r || '50%'}">${colors.map(c => `<stop offset="${c.offset}" stop-color="${c.color}"/>`).join('')}</radialGradient></defs>`;
  }
  return `  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${colors.map(c => `<stop offset="${c.offset}" stop-color="${c.color}"/>`).join('')}</linearGradient></defs>`;
};

// ── Background SVGs (Rich Gradients) ──
const bgSvgs = {
  'Midnight Blue': svg(512, 512, grad('bg', [{offset:'0%', color:'#0f172a'}, {offset:'100%', color:'#1e1b4b'}]) + '\n  <rect width="512" height="512" fill="url(#bg)"/>'),
  'Sunset Orange': svg(512, 512, grad('bg', [{offset:'0%', color:'#f97316'}, {offset:'100%', color:'#ea580c'}]) + '\n  <rect width="512" height="512" fill="url(#bg)"/>'),
  'Neon Purple': svg(512, 512, grad('bg', [{offset:'0%', color:'#a855f7'}, {offset:'100%', color:'#7e22ce'}]) + '\n  <rect width="512" height="512" fill="url(#bg)"/>'),
  'Forest Green': svg(512, 512, grad('bg', [{offset:'0%', color:'#22c55e'}, {offset:'100%', color:'#15803d'}]) + '\n  <rect width="512" height="512" fill="url(#bg)"/>'),
  'Crimson': svg(512, 512, grad('bg', [{offset:'0%', color:'#ef4444'}, {offset:'100%', color:'#b91c1c'}]) + '\n  <rect width="512" height="512" fill="url(#bg)"/>'),
  'Arctic': svg(512, 512, grad('bg', [{offset:'0%', color:'#bae6fd'}, {offset:'100%', color:'#7dd3fc'}]) + '\n  <rect width="512" height="512" fill="url(#bg)"/>'),
  'Gold Rush': svg(512, 512, grad('bg', [{offset:'0%', color:'#fbbf24'}, {offset:'100%', color:'#d97706'}]) + '\n  <rect width="512" height="512" fill="url(#bg)"/>'),
  'Void Black': svg(512, 512, '<rect width="512" height="512" fill="#020617"/>'),
  'Cyber Pink': svg(512, 512, grad('bg', [{offset:'0%', color:'#f472b6'}, {offset:'100%', color:'#db2777'}]) + '\n  <rect width="512" height="512" fill="url(#bg)"/>'),
  'Ocean': svg(512, 512, grad('bg', [{offset:'0%', color:'#0ea5e9'}, {offset:'100%', color:'#0369a1'}]) + '\n  <rect width="512" height="512" fill="url(#bg)"/>'),
};

// ── Doge Body Base (Premium Paths) ──
const dogeBodies = {
  'Tan': { main: '#d4a574', dark: '#b48a5e', light: '#e5c9a9', snout: '#f5e6d3' },
  'Golden': { main: '#fbbf24', dark: '#d97706', light: '#fde68a', snout: '#fef3c7' },
  'Brown': { main: '#92400e', dark: '#78350f', light: '#b45309', snout: '#d7ccc8' },
  'Gray': { main: '#64748b', dark: '#475569', light: '#94a3b8', snout: '#cbd5e1' },
  'White': { main: '#f8fafc', dark: '#e2e8f0', light: '#ffffff', snout: '#f1f5f9' },
  'Black': { main: '#1e293b', dark: '#0f172a', light: '#334155', snout: '#475569' },
  'Red': { main: '#dc2626', dark: '#991b1b', light: '#ef4444', snout: '#fee2e2' },
  'Cream': { main: '#fffbeb', dark: '#fef3c7', light: '#ffffff', snout: '#fff7ed' },
};

function makeDogeBody(c) {
  return [
    // Neck/Body Shadow
    pathEl('M140,400 Q256,385 372,400 L390,512 L122,512 Z', c.dark, 'opacity="0.3"'),
    // Main Body
    pathEl('M140.5,419.5 L372.5,419.5 Q380,450 380,512 L132,512 Q132,450 140.5,419.5 Z', c.main),
    // Ears
    pathEl('M170,195 L145,130 Q170,110 205,150 Z', c.main), // Left Ear
    pathEl('M170,195 L155,150 Q175,135 185,175 Z', c.dark, 'opacity="0.4"'), // Left Ear Inner
    pathEl('M342,195 L367,130 Q342,110 307,150 Z', c.main), // Right Ear
    pathEl('M342,195 L357,150 Q337,135 327,175 Z', c.dark, 'opacity="0.4"'), // Right Ear Inner
    // Head
    pathEl('M256,125 Q135,125 135,245 Q135,340 256,340 Q377,340 377,245 Q377,125 256,125 Z', c.main),
    // Head Highlight
    pathEl('M256,135 Q150,135 150,230 Q150,260 256,260 Z', c.light, 'opacity="0.2"'),
    // Snout
    pathEl('M256,245 Q310,245 325,285 Q325,315 256,330 Q187,315 187,285 Q195,245 256,245 Z', c.snout),
    // Nose
    pathEl('M244,282 Q256,274 268,282 Q274,290 256,298 Q238,290 244,282 Z', '#1e293b'),
    pathEl('M252,284 Q256,281 260,284', '#ffffff', 'opacity="0.3"'), // Nose light
  ].join('\n');
}

// ── Eyes SVGs (More expressive/layered) ──
const eyeSvgs = {
  'Normal': [
    pathEl('M220,215 Q235,210 242,225 Q235,240 220,235 Q205,230 220,215 Z', '#ffffff'), // Left
    pathEl('M292,215 Q307,210 314,225 Q307,240 292,235 Q277,230 292,215 Z', '#ffffff'), // Right
    pathEl('M228,222 Q234,220 236,226 Q234,232 228,230 Q222,228 228,222 Z', '#0f172a'), // Pupil L
    pathEl('M298,222 Q304,220 306,226 Q304,232 298,230 Q292,228 298,222 Z', '#0f172a'), // Pupil R
  ].join('\n'),
  'Sunglasses': [
    pathEl('M195,210 L317,210 L317,245 Q256,255 195,245 Z', '#0f172a'), // Frame
    pathEl('M205,215 L250,215 L250,240 Q227,245 205,240 Z', '#334155'), // Lens L
    pathEl('M262,215 L307,215 L307,240 Q285,245 262,240 Z', '#334155'), // Lens R
    pathEl('M205,215 L230,220', '#ffffff', 'opacity="0.1" stroke-width="2" stroke="#fff"'), // Reflection
  ].join('\n'),
  'Laser': [
    grad('l_red', [{offset:'0%', color:'#ef4444'}, {offset:'100%', color:'#ff000000'}], 'radial', {cx:'230', cy:'225', r:'30'}),
    grad('r_red', [{offset:'0%', color:'#ef4444'}, {offset:'100%', color:'#ff000000'}], 'radial', {cx:'300', cy:'225', r:'30'}),
    `<circle cx="230" cy="225" r="25" fill="url(#l_red)"/>`,
    `<circle cx="300" cy="225" r="25" fill="url(#r_red)"/>`,
    `<circle cx="230" cy="225" r="8" fill="#ffffff"/>`,
    `<circle cx="300" cy="225" r="8" fill="#ffffff"/>`,
  ].join('\n'),
  'Heart Eyes': [
    pathEl('M220,230 C200,210 230,205 235,220 C240,205 270,210 250,230 L235,245 Z', '#f43f5e'),
    pathEl('M280,230 C260,210 290,205 295,220 C300,205 330,210 310,230 L295,245 Z', '#f43f5e'),
  ].join('\n'),
  'Sleepy': [
    pathEl('M210,225 Q230,235 250,225', 'none', 'stroke="#475569" stroke-width="4" stroke-linecap="round" fill="none"'),
    pathEl('M280,225 Q300,235 320,225', 'none', 'stroke="#475569" stroke-width="4" stroke-linecap="round" fill="none"'),
  ].join('\n'),
  'Dollar Signs': [
    `<text x="230" y="238" font-size="32" fill="#22c55e" text-anchor="middle" font-weight="900" style="font-family: sans-serif;">$</text>`,
    `<text x="300" y="238" font-size="32" fill="#22c55e" text-anchor="middle" font-weight="900" style="font-family: sans-serif;">$</text>`,
  ].join('\n'),
  'Cyber Visor': [
    pathEl('M190,210 L322,210 L322,240 L190,240 Z', '#0891b2', 'opacity="0.8"'),
    pathEl('M195,215 L317,215', 'none', 'stroke="#22d3ee" stroke-width="1"'),
    `<rect x="190" y="210" width="132" height="30" fill="none" stroke="#22d3ee" stroke-width="2"/>`,
  ].join('\n'),
  'Bloodshot': [
    pathEl('M220,215 Q235,210 242,225 Q235,240 220,235 Q205,230 220,215 Z', '#fee2e2'),
    pathEl('M292,215 Q307,210 314,225 Q307,240 292,235 Q277,230 292,215 Z', '#fee2e2'),
    pathEl('M215,220 L225,223', 'none', 'stroke="#ef4444" stroke-width="0.5"'),
    pathEl('M300,220 L290,223', 'none', 'stroke="#ef4444" stroke-width="0.5"'),
    pathEl('M230,222 Q234,220 236,226 Q234,232 230,230 Z', '#0f172a'),
    pathEl('M300,222 Q306,220 308,226 Q306,232 300,230 Z', '#0f172a'),
  ].join('\n'),
};

// ── Mouth SVGs ──
const mouthSvgs = {
  'Smile': pathEl('M235,305 Q256,330 277,305', 'none', 'stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"'),
  'Tongue Out': [
    pathEl('M235,305 Q256,330 277,305', 'none', 'stroke="#1e293b" stroke-width="3" fill="none"'),
    pathEl('M250,314 Q256,335 262,314 Z', '#f43f5e'),
  ].join('\n'),
  'Grin': [
    pathEl('M230,300 Q256,335 282,300 Z', '#ffffff'),
    pathEl('M230,300 Q256,335 282,300', 'none', 'stroke="#1e293b" stroke-width="2" fill="none"'),
    pathEl('M245,300 L245,315', 'none', 'stroke="#e2e8f0" stroke-width="1"'),
    pathEl('M267,300 L267,315', 'none', 'stroke="#e2e8f0" stroke-width="1"'),
  ].join('\n'),
  'Cigar': [
    pathEl('M265,308 L310,302', 'none', 'stroke="#713f12" stroke-width="8" stroke-linecap="round"'),
    pathEl('M310,302 L315,301', 'none', 'stroke="#ef4444" stroke-width="6" stroke-linecap="round"'), // Tip
    pathEl('M315,301 Q325,285 320,270', 'none', 'stroke="#ffffff" stroke-width="2" stroke-dasharray="2,2" opacity="0.3" fill="none"'), // Smoke
  ].join('\n'),
  'Bone': [
    pathEl('M235,305 L277,305', '#f1f5f9', 'stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"'),
    `<circle cx="235" cy="302" r="6" fill="#f1f5f9"/>`,
    `<circle cx="235" cy="308" r="6" fill="#f1f5f9"/>`,
    `<circle cx="277" cy="302" r="6" fill="#f1f5f9"/>`,
    `<circle cx="277" cy="308" r="6" fill="#f1f5f9"/>`,
  ].join('\n'),
  'Pizza': [
    pathEl('M245,305 L275,305 L260,335 Z', '#eab308'),
    `<circle cx="255" cy="310" r="3" fill="#ef4444"/>`,
    `<circle cx="265" cy="315" r="2" fill="#ef4444"/>`,
  ].join('\n'),
};

// ── Hat SVGs (Layered/Gradients) ──
const hatSvgs = {
  'None': '',
  'Crown': [
    grad('gold', [{offset:'0%', color:'#fcd34d'}, {offset:'100%', color:'#fbbf24'}]),
    pathEl('M185,150 L205,100 L230,140 L256,90 L282,140 L307,100 L327,150 L185,150 Z', 'url(#gold)', 'stroke="#d97706" stroke-width="2"'),
    pathEl('M185,150 L327,150 L327,165 L185,165 Z', '#f59e0b', 'stroke="#d97706" stroke-width="2"'),
    `<circle cx="256" cy="115" r="5" fill="#ef4444"/>`, // Gem
  ].join('\n'),
  'Beanie': [
    pathEl('M185,170 Q256,120 327,170 L327,185 Q256,175 185,185 Z', '#dc2626'),
    pathEl('M240,125 Q256,110 272,125 Q256,140 240,125 Z', '#ffffff'), // Pom pom
  ].join('\n'),
  'Top Hat': [
    pathEl('M210,100 L302,100 L302,175 L210,175 Z', '#0f172a'),
    pathEl('M185,175 L327,175 L327,185 L185,185 Z', '#0f172a'),
    pathEl('M210,155 L302,155 L302,162 L210,162 Z', '#dc2626'), // Band
  ].join('\n'),
  'Cap': [
    pathEl('M195,170 Q256,115 317,170', '#2563eb'),
    pathEl('M310,170 L360,185 Q310,195 310,170 Z', '#1d4ed8'), // Bill
    pathEl('M195,170 Q256,180 317,170 L317,180 Q256,190 195,180 Z', '#2563eb'),
  ].join('\n'),
  'Cowboy': [
    pathEl('M170,175 Q256,155 342,175 L342,185 Q256,165 170,185 Z', '#713f12'), // Brim
    pathEl('M215,125 Q256,115 297,125 L297,175 L215,175 Z', '#713f12'), // Crown
    pathEl('M215,155 L297,155 L297,162 L215,162 Z', '#a16207'), // Band
  ].join('\n'),
  'Pirate': [
    pathEl('M185,175 Q256,100 327,175 Z', '#0f172a'),
    `<text x="256" y="155" fill="white" font-size="24" text-anchor="middle">☠</text>`,
  ].join('\n'),
  'Halo': [
    grad('halo_g', [{offset:'0%', color:'#fbbf24'}, {offset:'100%', color:'#fbbf2400'}], 'radial', {cx:'256', cy:'110', r:'50'}),
    `<ellipse cx="256" cy="110" rx="60" ry="15" fill="none" stroke="url(#halo_g)" stroke-width="4"/>`,
  ].join('\n'),
};

// ── Clothes SVGs ──
const clothesSvgs = {
  'None': '',
  'Hoodie': [
    pathEl('M140,419 Q256,400 372,419 L385,512 L127,512 Z', '#334155'),
    pathEl('M215,410 Q256,395 297,410 L285,450 Q256,440 227,450 Z', '#1e293b'), // Hood opening
  ].join('\n'),
  'Tuxedo': [
    pathEl('M140,419 Q256,410 372,419 L385,512 L127,512 Z', '#0f172a'),
    pathEl('M256,419 L210,512 Z', '#ffffff'), // Shirt L
    pathEl('M256,419 L302,512 Z', '#ffffff'), // Shirt R
    pathEl('M245,430 L256,420 L267,430 L256,440 Z', '#0f172a'), // Bow tie
  ].join('\n'),
  'Hawaiian': [
    pathEl('M140,419 Q256,410 372,419 L385,512 L127,512 Z', '#0891b2'),
    `<circle cx="200" cy="450" r="10" fill="#fbbf24" opacity="0.4"/>`,
    `<circle cx="300" cy="480" r="15" fill="#f472b6" opacity="0.4"/>`,
    `<circle cx="170" cy="490" r="8" fill="#ffffff" opacity="0.4"/>`,
  ].join('\n'),
  'Armor': [
    pathEl('M140,419 Q256,410 372,419 L385,512 L127,512 Z', '#475569'),
    pathEl('M160,430 L352,430 L352,450 L160,450 Z', '#64748b'), // Plates
    pathEl('M180,470 L332,470 L332,490 L180,490 Z', '#64748b'),
  ].join('\n'),
  'Chain Mail': [
    pathEl('M140,419 Q256,410 372,419 L385,512 L127,512 Z', '#1e293b'),
    `<pattern id="chain" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="3" fill="none" stroke="#64748b" stroke-width="1"/></pattern>`,
    `<rect x="140" y="420" width="232" height="92" fill="url(#chain)"/>`,
  ].join('\n'),
  'Space Suit': [
    pathEl('M140,419 Q256,410 372,419 L385,512 L127,512 Z', '#f1f5f9'),
    pathEl('M230,430 L282,430 L282,460 L230,460 Z', '#0891b2'), // Control panel
    `<circle cx="245" cy="445" r="3" fill="#ef4444"/>`,
    `<circle cx="265" cy="445" r="3" fill="#22c55e"/>`,
  ].join('\n'),
};

// ── Neck/Accessory SVGs (More detailed) ──
const neckSvgs = {
  'None': '',
  'Gold Chain': [
    pathEl('M205,340 Q256,375 307,340', 'none', 'stroke="#fbbf24" stroke-width="6" fill="none"'),
    pathEl('M250,370 L262,370 L256,385 Z', '#fbbf24'), // Pendant
  ].join('\n'),
  'Silver Chain': pathEl('M205,340 Q256,375 307,340', 'none', 'stroke="#cbd5e1" stroke-width="4" fill="none"'),
  'Bandana': [
    pathEl('M195,335 L317,335 L285,380 L227,380 Z', '#dc2626'),
    pathEl('M210,345 L230,345', 'none', 'stroke="#ffffff" stroke-width="1" opacity="0.3"'),
  ].join('\n'),
  'Bow Tie': [
    pathEl('M240,345 L256,335 L272,345 L256,355 Z', '#0f172a'),
    `<circle cx="256" cy="345" r="3" fill="#dc2626"/>`,
  ].join('\n'),
  'Scarf': pathEl('M195,335 Q256,380 317,335 L300,410 Q256,380 212,410 Z', '#7e22ce', 'opacity="0.9"'),
};

// ── Rarity system ──
const RARITIES = [
  { name: 'Legendary', weight: 2 },
  { name: 'Rare', weight: 5 },
  { name: 'Uncommon', weight: 15 },
  { name: 'Common', weight: 30 },
];
function assignRarity(idx, total) {
  if (idx === 0) return RARITIES[0];
  if (idx <= Math.ceil(total * 0.15)) return RARITIES[1];
  if (idx <= Math.ceil(total * 0.4)) return RARITIES[2];
  return RARITIES[3];
}

// ── Collection definitions ──
const collections = [
  {
    slug: 'doginal-dogs', name: 'Doginal Dogs', symbol: 'DD', supply: 10000,
    description: 'The iconic 10,000 pixel-art dogs inscribed on the Dogecoin blockchain. The largest Doginals collection.',
    categories: {
      Background: Object.keys(bgSvgs),
      Fur: Object.keys(dogeBodies),
      Eyes: Object.keys(eyeSvgs),
      Mouth: Object.keys(mouthSvgs),
      Hat: Object.keys(hatSvgs),
      Clothes: Object.keys(clothesSvgs),
      Accessory: Object.keys(neckSvgs),
    }
  },
  {
    slug: 'doge-punks', name: 'Doge Punks', symbol: 'DPK', supply: 10000,
    description: 'A byte-perfect CryptoPunks clone on the Dogecoin blockchain. 10,000 unique Doginals.',
    categories: {
      Background: ['Midnight Blue','Sunset Orange','Neon Purple','Crimson','Void Black'],
      Fur: ['Tan','Brown','Black','Gray','Golden'],
      Eyes: ['Normal','Sunglasses','Laser','Cyber Visor','Bloodshot'],
      Mouth: ['Smile','Grin','Cigar','Bone'],
      Hat: ['None','Crown','Top Hat','Cap','Pirate'],
      Clothes: ['None','Hoodie','Tuxedo','Armor'],
    }
  },
  {
    slug: 'doge-rocks', name: 'Doge Rocks', symbol: 'DRK', supply: 100,
    description: 'Only 100 rocks exist. The rarest Doginals collection on the blockchain.',
    categories: {
      Background: ['Ocean','Arctic','Gold Rush','Void Black'],
      Fur: ['Golden','White','Gray'],
      Eyes: ['Normal','Dollar Signs','Sleepy'],
      Hat: ['Crown','Halo','None'],
    }
  },
  {
    slug: 'ordinal-doges', name: 'Ordinal Doges', symbol: 'OD', supply: 2100,
    description: '2,100 unique Ordinal Doges — one for every 10,000 Bitcoin ever mined.',
    categories: {
      Background: ['Midnight Blue','Neon Purple','Forest Green','Crimson','Cyber Pink'],
      Fur: ['Tan','Golden','Brown','Red','Cream'],
      Eyes: ['Normal','Heart Eyes','Laser','Sunglasses','Dollar Signs'],
      Mouth: ['Smile','Tongue Out','Grin','Pizza'],
      Hat: ['None','Beanie','Cap','Crown'],
    }
  },
  {
    slug: 'doge-pixels', name: 'Doge Pixels', symbol: 'DPX', supply: 7777,
    description: '7,777 pixel warriors ready for battle on the Dogecoin blockchain.',
    categories: {
      Background: ['Crimson','Forest Green','Midnight Blue','Gold Rush','Void Black'],
      Fur: ['Brown','Black','Gray','Red'],
      Eyes: ['Normal','Cyber Visor','Bloodshot','Laser'],
      Hat: ['None','Pirate','Cowboy','Top Hat','Cap'],
      Clothes: ['None','Armor','Chain Mail','Space Suit'],
    }
  },
  {
    slug: 'shibe-world', name: 'Shibe World', symbol: 'SW', supply: 3333,
    description: '3,333 Shibes exploring fantastical worlds across the Dogecoin universe.',
    categories: {
      Background: ['Ocean','Forest Green','Arctic','Cyber Pink','Sunset Orange','Gold Rush'],
      Fur: ['Tan','Golden','Cream','White','Brown'],
      Eyes: ['Normal','Heart Eyes','Sleepy','Sunglasses'],
      Mouth: ['Smile','Tongue Out','Bone','Pizza'],
      Hat: ['None','Beanie','Crown','Halo','Cowboy'],
      Accessory: ['None','Gold Chain','Scarf','Bow Tie'],
    }
  }
];

// ── SVG lookup maps ──
const svgLookup = {
  Background: bgSvgs,
  Fur: null, // special handling
  Eyes: eyeSvgs,
  Mouth: mouthSvgs,
  Hat: hatSvgs,
  Clothes: clothesSvgs,
  Accessory: neckSvgs,
};

function getTraitSvg(category, traitName) {
  if (category === 'Fur') {
    const body = dogeBodies[traitName];
    if (!body) return svg(512, 512, rect(0,0,512,512,'#ccc'));
    return svg(512, 512, makeDogeBody(body));
  }
  const map = svgLookup[category];
  if (!map || !map[traitName]) return svg(512, 512, '');
  if (category === 'Background') return map[traitName];
  return svg(512, 512, map[traitName]);
}

// ── Main generation ──
function generate() {
  if (!fs.existsSync(ROOT)) fs.mkdirSync(ROOT, { recursive: true });

  // Remove old mock collections first
  const oldMocks = ['doge-apes','doge-pixels','doge-punks','doge-rocks','ordinal-doges','shibe-world'];
  oldMocks.forEach(slug => {
    const dir = path.join(ROOT, slug);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`  Removed old mock: ${slug}`);
    }
  });

  collections.forEach(col => {
    const dir = path.join(ROOT, col.slug);
    const traitsDir = path.join(dir, 'traits');
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(traitsDir, { recursive: true });

    const metaTraits = {};

    Object.entries(col.categories).forEach(([category, traitNames]) => {
      const catDir = path.join(traitsDir, category);
      fs.mkdirSync(catDir, { recursive: true });
      metaTraits[category] = [];

      traitNames.forEach((name, idx) => {
        const safeName = name.replace(/\s+/g, '_');
        const rarity = assignRarity(idx, traitNames.length);

        // Write SVG
        const svgContent = getTraitSvg(category, name);
        fs.writeFileSync(path.join(catDir, `${safeName}.svg`), svgContent);

        // Write JSON metadata
        const meta = {
          name, category,
          rarity: rarity.name,
          weight: rarity.weight,
          image: `${safeName}.svg`,
          attributes: { variant: name.toLowerCase().replace(/\s+/g, '-') }
        };
        fs.writeFileSync(path.join(catDir, `${safeName}.json`), JSON.stringify(meta, null, 2));

        metaTraits[category].push({
          name, rarity: rarity.name, weight: rarity.weight,
          image: `traits/${category}/${safeName}.svg`
        });
      });
    });

    // info.json
    fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify({
      id: col.slug, name: col.name, symbol: col.symbol,
      description: col.description, totalSupply: col.supply,
      mintPrice: 100, traitCount: Object.values(col.categories).flat().length,
      categories: Object.keys(col.categories),
      rarityTiers: ['Legendary','Rare','Uncommon','Common']
    }, null, 2));

    // metadata.json
    fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify({ traits: metaTraits }, null, 2));

    const traitCount = Object.values(col.categories).flat().length;
    console.log(`✅ ${col.name}: ${Object.keys(col.categories).length} categories, ${traitCount} traits`);
  });

  console.log('\n🎉 All real collections generated!');
}

generate();
