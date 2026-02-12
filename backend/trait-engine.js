const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * TraitEngine handles the logic for shuffling and locking traits.
 * Loads trait sets from a directory structure with JSON metadata and SVG images.
 * Supports rarity-weighted shuffling.
 */
class TraitEngine {
  constructor(collectionDir) {
    this.collectionDir = collectionDir;
    this.categories = {};       // { category: [trait names] }
    this.traitMetadata = {};    // { category: { traitName: { rarity, weight, image } } }
    this.loadTraits();
  }

  loadTraits() {
    const traitsPath = path.join(this.collectionDir, 'traits');
    if (!fs.existsSync(traitsPath)) {
      throw new Error(`Traits directory not found: ${traitsPath}`);
    }

    const folders = fs.readdirSync(traitsPath);
    folders.forEach(folder => {
      const folderPath = path.join(traitsPath, folder);
      if (!fs.statSync(folderPath).isDirectory()) return;

      // Read JSON metadata files
      const jsonFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'));
      
      if (jsonFiles.length > 0) {
        this.categories[folder] = [];
        this.traitMetadata[folder] = {};
        
        jsonFiles.forEach(jsonFile => {
          try {
            const meta = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFile), 'utf8'));
            this.categories[folder].push(meta.name);
            this.traitMetadata[folder][meta.name] = {
              rarity: meta.rarity,
              weight: meta.weight,
              image: meta.image,
              imagePath: `traits/${folder}/${meta.image}`,
            };
          } catch (err) {
            // Skip malformed JSON
          }
        });
      } else {
        // Fallback: read SVG/PNG filenames directly
        const imgFiles = fs.readdirSync(folderPath)
          .filter(f => f.endsWith('.svg') || f.endsWith('.png'))
          .map(f => path.parse(f).name.replace(/_/g, ' '));

        if (imgFiles.length > 0) {
          this.categories[folder] = imgFiles;
        }
      }
    });

    this.traitNames = Object.keys(this.categories);
  }

  /**
   * Rarity-weighted random selection from a category.
   */
  _weightedRandom(category) {
    const traits = this.categories[category];
    const meta = this.traitMetadata[category];
    
    if (!meta) {
      // No metadata: uniform random
      return traits[Math.floor(Math.random() * traits.length)];
    }

    // Build weighted pool
    const pool = [];
    traits.forEach(name => {
      const weight = meta[name]?.weight || 10;
      for (let i = 0; i < weight; i++) pool.push(name);
    });

    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Generates a random combination of traits with rarity weighting.
   * @param {Object} lockedTraits - { categoryName: traitValue } for traits that shouldn't change.
   * @returns {Object} - The new combination of traits.
   */
  shuffle(lockedTraits = {}) {
    const result = { ...lockedTraits };
    
    for (const category of this.traitNames) {
      if (!lockedTraits[category]) {
        result[category] = this._weightedRandom(category);
      }
    }
    
    return result;
  }

  /**
   * Get rarity info for a trait combination.
   */
  getRarityInfo(traits) {
    const info = {};
    for (const [category, traitName] of Object.entries(traits)) {
      const meta = this.traitMetadata[category]?.[traitName];
      info[category] = {
        name: traitName,
        rarity: meta?.rarity || 'Common',
        image: meta?.imagePath || null,
      };
    }
    return info;
  }

  /**
   * Computes a deterministic hash for a trait combination.
   */
  computeTraitHash(traits) {
    const sortedTraits = Object.keys(traits)
      .sort()
      .map(key => `${key}:${traits[key]}`)
      .join('|');
    
    return crypto.createHash('sha256').update(sortedTraits).digest('hex');
  }
}

module.exports = TraitEngine;
