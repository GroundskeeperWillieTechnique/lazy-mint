const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '../data/collections');

// SVG helpers
const svg = (w, h, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n${content}\n</svg>`;
const rect = (x, y, w, h, fill, extra = '') => `  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const circle = (cx, cy, r, fill, extra = '') => `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const ellipse = (cx, cy, rx, ry, fill, extra = '') => `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const pathEl = (d, fill, extra = '') => `  <path d="${d}" fill="${fill}" ${extra}/>`;
const grad = (id, c1, c2, dir = 'v') => {
  if (dir === 'r') return `  <defs><radialGradient id="${id}" cx="50%" cy="50%" r="70%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></radialGradient></defs>`;
  return `  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>`;
};

// ── Background SVGs ──
const bgSvgs = {
  'Midnight Blue': svg(512, 512, grad('bg','#0a1628','#1a3a5c') + '\n' + rect(0,0,512,512,'url(#bg)')),
  'Sunset Orange': svg(512, 512, grad('bg','#ff6b35','#f7c948') + '\n' + rect(0,0,512,512,'url(#bg)')),
  'Neon Purple': svg(512, 512, grad('bg','#6b21a8','#c026d3') + '\n' + rect(0,0,512,512,'url(#bg)')),
  'Forest Green': svg(512, 512, grad('bg','#065f46','#34d399') + '\n' + rect(0,0,512,512,'url(#bg)')),
  'Crimson': svg(512, 512, grad('bg','#7f1d1d','#dc2626') + '\n' + rect(0,0,512,512,'url(#bg)')),
  'Arctic': svg(512, 512, grad('bg','#e0f2fe','#bae6fd') + '\n' + rect(0,0,512,512,'url(#bg)')),
  'Gold Rush': svg(512, 512, grad('bg','#92400e','#fbbf24') + '\n' + rect(0,0,512,512,'url(#bg)')),
  'Void Black': svg(512, 512, rect(0,0,512,512,'#0a0a0a')),
  'Cyber Pink': svg(512, 512, grad('bg','#831843','#f472b6') + '\n' + rect(0,0,512,512,'url(#bg)')),
  'Ocean': svg(512, 512, grad('bg','#0c4a6e','#22d3ee') + '\n' + rect(0,0,512,512,'url(#bg)')),
};

// ── Doge body base SVGs ──
const dogeBodies = {
  'Tan': { color: '#d4a574', snout: '#f5e6d3' },
  'Golden': { color: '#daa520', snout: '#fef3c7' },
  'Brown': { color: '#8d5524', snout: '#d7ccc8' },
  'Gray': { color: '#6b7280', snout: '#d1d5db' },
  'White': { color: '#e5e7eb', snout: '#f9fafb' },
  'Black': { color: '#1f2937', snout: '#4b5563' },
  'Red': { color: '#b45309', snout: '#fde68a' },
  'Cream': { color: '#fef3c7', snout: '#fffbeb' },
};

function makeDogeBody(col) {
  const c = col.color, s = col.snout;
  return [
    `  <defs><filter id="sh"><feOffset in="SourceAlpha" dx="2" dy="2"/><feGaussianBlur stdDeviation="2"/><feBlend in="SourceGraphic" mode="normal"/></filter></defs>`,
    pathEl('M140,400 Q256,380 372,400 L372,512 L140,512 Z', c, 'filter="url(#sh)"'),
    rect(220,320,72,100, c, 'filter="url(#sh)"'),
    circle(256,240,95, c, 'filter="url(#sh)"'),
    ellipse(276,285,55,40, s, 'filter="url(#sh)"'),
    circle(185,180,28, c, 'filter="url(#sh)"'),
    circle(185,180,14, s, 'opacity="0.5"'),
    circle(327,180,28, c, 'filter="url(#sh)"'),
    circle(327,180,14, s, 'opacity="0.5"'),
    circle(270,290,8, '#1a1a1a'),
  ].join('\n');
}

// ── Eyes SVGs ──
const eyeSvgs = {
  'Normal': [circle(230,225,12,'white'), circle(290,225,12,'white'), circle(232,223,6,'#1a1a1a'), circle(292,223,6,'#1a1a1a')].join('\n'),
  'Sunglasses': [rect(200,210,140,28,'#1a1a1a','rx="8"'), rect(210,208,50,32,'#333','rx="6"'), rect(280,208,50,32,'#333','rx="6"')].join('\n'),
  'Laser': [circle(230,225,14,'#ff0000','opacity="0.3"'), circle(230,225,7,'#ff0000'), circle(290,225,14,'#ff0000','opacity="0.3"'), circle(290,225,7,'#ff0000')].join('\n'),
  'Heart Eyes': [pathEl('M225,230 C225,218 215,212 225,222 C235,212 225,218 225,230Z','#ef4444'), pathEl('M285,230 C285,218 275,212 285,222 C295,212 285,218 285,230Z','#ef4444')].join('\n'),
  'Sleepy': [`  <line x1="218" y1="225" x2="242" y2="225" stroke="#555" stroke-width="3" stroke-linecap="round"/>`, `  <line x1="278" y1="225" x2="302" y2="225" stroke="#555" stroke-width="3" stroke-linecap="round"/>`].join('\n'),
  'Dollar Signs': [
    `  <text x="230" y="232" font-size="24" fill="#22c55e" text-anchor="middle" font-weight="bold">$</text>`,
    `  <text x="290" y="232" font-size="24" fill="#22c55e" text-anchor="middle" font-weight="bold">$</text>`
  ].join('\n'),
  'Cyber Visor': [rect(195,212,130,22,'#06b6d4','rx="11" opacity="0.8"'), rect(195,212,130,22,'none','rx="11" stroke="#22d3ee" stroke-width="2"')].join('\n'),
  'Bloodshot': [circle(230,225,12,'#fecaca'), circle(290,225,12,'#fecaca'), circle(232,223,5,'#1a1a1a'), circle(292,223,5,'#1a1a1a'), `  <line x1="220" y1="220" x2="226" y2="224" stroke="#ef4444" stroke-width="1"/>`, `  <line x1="282" y1="220" x2="286" y2="224" stroke="#ef4444" stroke-width="1"/>`].join('\n'),
};

// ── Mouth SVGs ──
const mouthSvgs = {
  'Smile': pathEl('M250,305 Q270,320 290,305','none','stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" fill="none"'),
  'Tongue Out': [pathEl('M250,305 Q270,320 290,305','none','stroke="#1a1a1a" stroke-width="3" fill="none"'), ellipse(270,315,10,8,'#ef4444')].join('\n'),
  'Grin': [pathEl('M245,300 Q270,325 295,300','none','stroke="#1a1a1a" stroke-width="3" fill="none"'), rect(258,300,24,8,'white','rx="2"')].join('\n'),
  'Cigar': [pathEl('M250,308 L295,308','none','stroke="#92400e" stroke-width="5" stroke-linecap="round"'), circle(298,308,4,'#ef4444','opacity="0.8"')].join('\n'),
  'Bone': [rect(248,302,50,10,'#fef3c7','rx="5"'), circle(248,307,7,'#fef3c7'), circle(298,307,7,'#fef3c7')].join('\n'),
  'Pizza': pathEl('M260,295 L280,295 L270,315 Z','#f59e0b','stroke="#92400e" stroke-width="1"'),
};

// ── Hat SVGs ──
const hatSvgs = {
  'None': '',
  'Crown': [pathEl('M200,160 L220,120 L240,150 L256,110 L272,150 L292,120 L312,160 Z','#fbbf24','stroke="#92400e" stroke-width="2"'), rect(200,155,112,18,'#fbbf24','stroke="#92400e" stroke-width="2"')].join('\n'),
  'Beanie': [ellipse(256,165,70,35,'#dc2626'), rect(186,165,140,10,'#dc2626'), circle(256,130,8,'#dc2626')].join('\n'),
  'Top Hat': [rect(215,100,82,70,'#111827'), rect(200,165,112,12,'#111827'), rect(215,100,82,8,'#4b5563')].join('\n'),
  'Cap': [ellipse(256,170,75,20,'#2563eb'), pathEl('M181,170 Q256,110 331,170','#2563eb'), pathEl('M315,170 L360,180 L315,185','#1d4ed8')].join('\n'),
  'Cowboy': [ellipse(256,170,90,15,'#92400e'), pathEl('M166,170 Q256,100 346,170','#a16207'), rect(220,120,72,50,'#a16207','rx="8"')].join('\n'),
  'Pirate': [pathEl('M200,170 L256,100 L312,170','#1a1a1a'), rect(200,165,112,10,'#1a1a1a'), `  <text x="256" y="148" font-size="18" fill="white" text-anchor="middle">☠</text>`].join('\n'),
  'Halo': circle(256,135,45,'none','stroke="#fbbf24" stroke-width="4" opacity="0.7"'),
};

// ── Clothes SVGs ──
const clothesSvgs = {
  'None': '',
  'Hoodie': [pathEl('M140,400 Q256,375 372,400 L372,512 L140,512 Z','#374151'), pathEl('M220,380 Q256,360 292,380 L292,420 Q256,400 220,420 Z','#1f2937')].join('\n'),
  'Tuxedo': [pathEl('M140,400 Q256,380 372,400 L372,512 L140,512 Z','#111827'), pathEl('M240,400 L256,512','none','stroke="#d1d5db" stroke-width="2"'), circle(256,420,4,'#d1d5db')].join('\n'),
  'Hawaiian': [pathEl('M140,400 Q256,380 372,400 L372,512 L140,512 Z','#059669'), circle(180,440,8,'#fbbf24','opacity="0.5"'), circle(280,420,6,'#f472b6','opacity="0.5"'), circle(340,450,7,'#fbbf24','opacity="0.5"'), circle(220,460,5,'#f472b6','opacity="0.5"')].join('\n'),
  'Armor': [pathEl('M140,400 Q256,380 372,400 L372,512 L140,512 Z','#6b7280'), rect(200,400,112,40,'#9ca3af','rx="4"'), rect(210,445,92,30,'#9ca3af','rx="4"')].join('\n'),
  'Chain Mail': [pathEl('M140,400 Q256,380 372,400 L372,512 L140,512 Z','#4b5563'), circle(170,430,8,'none','stroke="#9ca3af" stroke-width="1"'), circle(195,430,8,'none','stroke="#9ca3af" stroke-width="1"'), circle(220,430,8,'none','stroke="#9ca3af" stroke-width="1"'), circle(245,430,8,'none','stroke="#9ca3af" stroke-width="1"'), circle(270,430,8,'none','stroke="#9ca3af" stroke-width="1"'), circle(295,430,8,'none','stroke="#9ca3af" stroke-width="1"'), circle(320,430,8,'none','stroke="#9ca3af" stroke-width="1"'), circle(345,430,8,'none','stroke="#9ca3af" stroke-width="1"')].join('\n'),
  'Space Suit': [pathEl('M140,400 Q256,380 372,400 L372,512 L140,512 Z','#e5e7eb'), rect(230,400,52,20,'#06b6d4','rx="4"'), circle(256,410,6,'#22d3ee','opacity="0.6"')].join('\n'),
};

// ── Neck/Accessory SVGs ──
const neckSvgs = {
  'None': '',
  'Gold Chain': [pathEl('M210,350 Q256,375 302,350','none','stroke="#fbbf24" stroke-width="4" fill="none"'), circle(256,378,8,'#fbbf24')].join('\n'),
  'Silver Chain': pathEl('M210,350 Q256,370 302,350','none','stroke="#9ca3af" stroke-width="3" fill="none"'),
  'Bandana': pathEl('M200,340 L312,340 L280,365 L230,365 Z','#dc2626'),
  'Bow Tie': [pathEl('M240,350 L256,340 L272,350 L256,360 Z','#1a1a1a'), circle(256,350,5,'#dc2626')].join('\n'),
  'Scarf': pathEl('M200,340 Q256,370 312,340 L295,380 Q256,360 217,380 Z','#7c3aed','opacity="0.8"'),
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
