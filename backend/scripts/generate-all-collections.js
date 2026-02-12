const fs = require('fs');
const path = require('path');

const COLLECTIONS_ROOT = path.join(__dirname, '../data/collections');

const collections = [
  { 
    slug: 'doge-punks', 
    name: 'Doge Punks', 
    supply: 10000,
    traits: ['Hat', 'Head', 'Eyes', 'Mouth', 'Background']
  },
  { 
    slug: 'doge-apes', 
    name: 'Doge Apes', 
    supply: 5000,
    traits: ['Fur', 'Hat', 'Eyes', 'Clothes', 'Background']
  },
  { 
    slug: 'doge-rocks', 
    name: 'Doge Rocks', 
    supply: 100,
    traits: ['Type', 'Background']
  },
  { 
    slug: 'ordinal-doges', 
    name: 'Ordinal Doges', 
    supply: 2100,
    traits: ['Head', 'Eyes', 'Mouth']
  },
  { 
    slug: 'doge-pixels', 
    name: 'Doge Pixels', 
    supply: 7777,
    traits: ['Hat', 'Weapon', 'Shield']
  },
  { 
    slug: 'shibe-world', 
    name: 'Shibe World', 
    supply: 3333,
    traits: ['World', 'Character', 'Item']
  }
];

if (!fs.existsSync(COLLECTIONS_ROOT)) {
  fs.mkdirSync(COLLECTIONS_ROOT, { recursive: true });
}

collections.forEach(col => {
  const dir = path.join(COLLECTIONS_ROOT, col.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const traitsDir = path.join(dir, 'traits');
  if (!fs.existsSync(traitsDir)) fs.mkdirSync(traitsDir, { recursive: true });

  // Create info.json (Server expects this)
  const meta = {
    id: col.slug,
    name: col.name,
    description: `The official ${col.name} collection on Dogecoin.`,
    supply: col.supply,
    traits: col.traits
  };
  fs.writeFileSync(path.join(dir, 'info.json'), JSON.stringify(meta, null, 2));

  // Create dummy traits
  col.traits.forEach(trait => {
    const tDir = path.join(traitsDir, trait);
    if (!fs.existsSync(tDir)) fs.mkdirSync(tDir, { recursive: true });
    
    // Create 3 dummy variants for each trait
    ['Common', 'Rare', 'Legendary'].forEach(variant => {
      // Create empty file or copy a placeholder image if I had one.
      // For now, let's just make it a JSON file? Or image?
      // Server usually looks for images.
      // I'll create detailed dummy .png files? No, just empty files with .png extension?
      // Or 1x1 pixel PNGs?
      // I'll use a 1x1 transparent pixel base64.
      const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
      fs.writeFileSync(path.join(tDir, `${variant}.png`), pixel);
    });
  });

  console.log(`Generated ${col.name}`);
});

console.log("All collections generated!");
