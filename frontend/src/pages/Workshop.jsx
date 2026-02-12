import React, { useState, useEffect } from 'react';
import { Shuffle, Lock, Unlock, ShieldCheck, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const ASSET_BASE = import.meta.env.VITE_ASSET_URL || '';

const RARITY_COLORS = {
  Legendary: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40' },
  Rare:      { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40' },
  Uncommon:  { bg: 'bg-blue-500/20',   text: 'text-blue-400',   border: 'border-blue-500/40' },
  Common:    { bg: 'bg-gray-500/20',    text: 'text-gray-400',   border: 'border-gray-500/40' },
};

const Workshop = ({ isConnected, userId, credits, setCredits, mintTransaction, userAddress }) => {
  const [traits, setTraits] = useState({
     Background: 'Blue',
     Fur: 'Brown',
     Clothes: 'None',
     Mouth: 'Smile',
     Eyes: 'Normal',
     Hat: 'None'
  });
  const [rarityInfo, setRarityInfo] = useState({});
  const [lockedTraits, setLockedTraits] = useState({});
  const [isShuffling, setIsShuffling] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [collectionInfo, setCollectionInfo] = useState({ name: 'Lazy Mint', categories: {} });
  const [traitImages, setTraitImages] = useState({});
  const [collections, setCollections] = useState([]);
  const [currentCollectionId, setCurrentCollectionId] = useState('');

  useEffect(() => {
    fetchCollectionInfo();
  }, []);

  const fetchCollectionInfo = async (collectionId = null) => {
    try {
      // 1. Get List of Collections
      const { data: cols } = await axios.get(`${API_BASE}/collections`);
      setCollections(cols);

      // 2. Select specific or default
      let targetId = collectionId;
      if (!targetId) {
          // Default to first available or fallback
          targetId = cols.length > 0 ? (cols[0].id || cols[0].slug) : 'doge-punks';
      }
      
      setCurrentCollectionId(targetId);

      // 3. Switch backend context and get full info
      // We must tell backend to switch so it loads the TraitEngine for this collection
      await axios.post(`${API_BASE}/collection/switch`, { collectionId: targetId });
      
      // Now fetch the full info which includes the processed categories from TraitEngine
      const { data: col } = await axios.get(`${API_BASE}/collection/info`);

      // 4. Process Traits/Categories
      // Backend now returns 'categories' as { Category: [Trait1, Trait2] }
      // and 'traitMetadata' if available.
      const categories = col.categories || {};
      
      // Flatten trait images
      const images = {};
      if (categories) {
        Object.entries(categories).forEach(([cat, traitsList]) => {
            images[cat] = {};
            if (Array.isArray(traitsList)) {
              traitsList.forEach(tName => {
                  // If we have metadata, use it, otherwise construct default path
                  const meta = col.traitMetadata?.[cat]?.[tName];
                  if (meta && meta.imagePath) {
                      images[cat][tName] = meta.imagePath;
                  } else {
                      // Fallback construction
                      const safeName = tName.replace(/\s+/g, '_');
                      images[cat][tName] = `${ASSET_BASE}/assets/collections/${targetId}/traits/${cat}/${safeName}.svg`;
                  }
              });
            }
        });
      }
      setTraitImages(images);
      
      // Default traits
      const defaults = {};
      if (categories) {
        Object.keys(categories).forEach(cat => {
            const list = categories[cat];
            // list is array of strings (names)
            defaults[cat] = (list && list.length > 0) ? list[0] : 'None';
        });
      }
      setTraits(defaults);
      setCollectionInfo(col);

    } catch (err) {
      console.error("Failed to fetch collection info", err);
    }
  };

  const handleSwitchCollection = async (e) => {
      const newId = e.target.value;
      // Optional: Call backend to switch context if backend requires it
      try {
          await axios.post(`${API_BASE}/collection/switch`, { collectionId: newId });
      } catch(e) {}
      fetchCollectionInfo(newId);
  };

  const handleShuffle = async () => {
    if (!isConnected) return;
    setIsShuffling(true);
    try {
      // Backend expects current collection state or specific endpoint?
      // Assuming /shuffle uses server-side 'currentCollection' state which we updated via switch
      const { data } = await axios.post(`${API_BASE}/shuffle`, { lockedTraits }, { withCredentials: true });
      setTimeout(() => {
        setTraits(data.traits);
        setRarityInfo(data.rarityInfo || {});
        setIsShuffling(false);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#fbbf24', '#fff', '#f59e0b'] });
      }, 700);
    } catch (err) {
      console.error("Shuffle failed", err);
      // Fallback for mock specific shuffle if backend fails?
      // Just shuffle client side for demo
      const newTraits = { ...traits };
      Object.keys(collectionInfo.categories).forEach(cat => {
          if (!lockedTraits[cat]) {
              const options = collectionInfo.categories[cat];
              if (options && options.length > 0) {
                 const random = options[Math.floor(Math.random() * options.length)];
                 newTraits[cat] = random.name;
              }
          }
      });
      setTraits(newTraits);
      setIsShuffling(false);
    }
  };

  const handleMint = async () => {
    if (!isConnected) return;
    setIsMinting(true);
    try {
      const TREASURY_ADDRESS = "D8vTwY4...REPLACE_WITH_YOUR_DOGE_ADDRESS..."; 
      
      let txid;
      try {
        txid = await mintTransaction(TREASURY_ADDRESS, 10000000000);
      } catch (e) {
        if (e.message.includes('No wallet')) alert('Please connect wallet first');
        else if (e.message.includes('Insufficient')) alert('Insufficient funds in Doge Wallet');
        else alert('Transaction failed: ' + e.message);
        throw e;
      }
      
      const { data } = await axios.post(`${API_BASE}/mint-doge`, {
        userAddress: userAddress || "Unknown",
        traitHash: "hash_" + Date.now(),
        txid,
        traits
      }, { withCredentials: true });

      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      alert(`✅ Minted! TX: ${txid}`);
    } catch (err) {
      console.error("Mint failed", err);
    } finally {
      setIsMinting(false);
    }
  };

  const toggleLock = (cat) => {
    if (!isConnected) return;
    setLockedTraits(prev => {
      const next = { ...prev };
      if (next[cat]) delete next[cat];
      else next[cat] = traits[cat];
      return next;
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-5 gap-8 animate-fade-in-up">
      {/* Preview Area */}
      <div className="xl:col-span-3 flex flex-col gap-6">
        {/* Collection Selector */}
        <div className="flex justify-between items-center">
             <div className="relative z-20">
                 <select 
                    value={currentCollectionId}
                    onChange={handleSwitchCollection}
                    className="appearance-none bg-white/5 border border-white/10 text-white font-black text-xl py-3 pl-6 pr-12 rounded-2xl hover:bg-white/10 focus:outline-none focus:border-doge/50 transition-all cursor-pointer"
                 >
                     {collections.map(c => (
                         <option key={c.id || c.slug} value={c.id || c.slug} className="bg-[#111] text-white">
                             {c.name}
                         </option>
                     ))}
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
             </div>
             
             <div className="flex gap-2">
                 <div className="bg-doge/10 px-4 py-2 rounded-xl border border-doge/20">
                     <span className="text-xs text-doge font-black tracking-wider">LIVE MINT</span>
                 </div>
             </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-doge/30 to-purple-600/30 rounded-[32px] blur-xl opacity-0 group-hover:opacity-20 transition duration-1000" />
          
          {/* Layered SVG Preview */}
          <div className="relative aspect-[4/3] glass rounded-[32px] overflow-hidden">
             {/* Render layers based on traits */}
             {/* Note: If images are 1x1 pixels (mock), this will look like a dot. 
                 Real app would use real images. */}
            <div className={`w-full h-full relative transition-all duration-500 ${isShuffling ? 'blur-lg grayscale scale-95' : ''} ${!isConnected ? 'opacity-80' : ''}`}>
               {/* Just render all categories in order? Or specific order? */}
               {collectionInfo.categories && Object.keys(collectionInfo.categories).map((cat, i) => {
                   const imgPath = traitImages[cat]?.[traits[cat]];
                   // If path is full URL (from server) or needs prefix?
                   // Server returns /assets/... usually. My script logic put it in traitImages.
                   // Wait, logic: `if (t.imagePath) images[cat][t.name] = t.imagePath;`
                   // I need to prepend ASSET_BASE if it doesn't have it?
                   // Or relying on server returning relative path?
                   // My script generated paths? No, script generated FILES. 
                   // server.js /api/collection/trait-images returns `/assets/...`
                   // But here I am constructing images manually from `col.categories`.
                   // My script didn't put image paths in `categories`...
                   // Wait, `generate-all-collections` script created `info.json` with `supply`.
                   // It did NOT add image paths to the trait objects in `info.json`.
                   // So `t.imagePath` will be undefined!
                   // I need to construct the URL manually: `/assets/collections/${currentCollectionId}/traits/${cat}/${traits[cat]}.png`
                   
                   const safeTrait = traits[cat].replace(/\s+/g, '_');
                   const url = imgPath || `${ASSET_BASE}/assets/collections/${currentCollectionId}/traits/${cat}/${safeTrait}.svg`;
                   
                   return (
                       <img 
                          key={cat} 
                          src={url} 
                          alt={cat}
                          className="absolute inset-0 w-full h-full object-contain drop-shadow-lg" 
                          style={{ zIndex: i }}
                       />
                   );
               })}
            </div>

            {isShuffling && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-sm z-10">
                <RefreshCw className="text-doge animate-spin" size={56} />
                <span className="text-doge font-black tracking-[0.3em] text-lg">SHUFFLING</span>
              </div>
            )}

            {!isConnected && !isShuffling && (
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center gap-2 z-10">
                <span className="text-xl font-black text-white px-6 py-2 rounded-xl bg-doge/10 backdrop-blur-xl border border-doge/20">
                  {collectionInfo.name || 'Lazy Mint'}
                </span>
                <span className="text-gray-400 text-sm">Connect wallet to start minting</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        <div className={`glass rounded-[32px] p-6 flex flex-col gap-4 transition-all ${!isConnected ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.15em]">Trait Selection</h3>
            <div className="text-[10px] text-doge bg-doge/10 px-3 py-1 rounded-full font-black border border-doge/20">
              {collectionInfo.categories ? Object.keys(collectionInfo.categories).length : 0} CATEGORIES
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
            {collectionInfo.categories && Object.keys(collectionInfo.categories).map(cat => {
              const rarity = 'Common'; // Mock rarity
              const rc = RARITY_COLORS.Common;
              const traitName = traits[cat];
              // Construct URL again
              const safeTraitName = traitName.replace(/\s+/g, '_');
              const imgUrl = `${ASSET_BASE}/assets/collections/${currentCollectionId}/traits/${cat}/${safeTraitName}.svg`;
              
              return (
                <div key={cat} className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5 hover:border-doge/20 transition-all">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/10">
                      <img src={imgUrl} onError={(e) => e.target.style.display = 'none'} alt="" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] text-gray-500 uppercase font-black tracking-wider">{cat}</span>
                    </div>
                    <span className="text-sm font-bold tracking-tight text-white/90 truncate block">
                      {traitName || "—"}
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleLock(cat)}
                    className={`p-2 rounded-xl transition-all shrink-0 ${
                      lockedTraits[cat] 
                        ? 'bg-doge text-black shadow-lg shadow-doge/20' 
                        : 'bg-white/5 text-gray-600 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {lockedTraits[cat] ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleShuffle}
            disabled={isShuffling || isMinting || !isConnected}
            className={`flex items-center justify-center gap-3 py-5 rounded-2xl text-xl font-black transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
              isConnected 
                ? 'bg-doge text-black shadow-xl shadow-doge/20 hover:-translate-y-0.5' 
                : 'bg-white/5 text-gray-600 border border-white/5'
            }`}
          >
            <Shuffle size={28} />
            {isConnected ? 'FREE SHUFFLE' : 'CONNECT WALLET'}
          </button>
          
          <button 
            onClick={handleMint}
            disabled={!isConnected || isShuffling || isMinting}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl text-lg font-black hover:bg-gray-100 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ShieldCheck size={24} />
            MINT INSCRIPTION (100 DOGE)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Workshop;
