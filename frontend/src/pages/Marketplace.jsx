import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, ChevronLeft, ShoppingCart, Loader, RefreshCw } from 'lucide-react';
import axios from 'axios';
import DogeMasterLogo from '../assets/doge-master-logo-v2.png';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const ASSET_BASE = import.meta.env.VITE_ASSET_URL || '';

const Marketplace = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const [error, setError] = useState(null);

  const fetchCollections = async () => {
    try {
      setError(null);
      const { data } = await axios.get(`${API_BASE}/collections`);
      setCollections(data);
    } catch (err) {
      console.error('Failed to fetch collections', err);
      setError(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const filtered = collections.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sample traits for preview
  const sampleTraits = {
    // Verified names from generate-real-collections.js
    Background: ['Arctic', 'Crimson', 'Gold_Rush', 'Midnight_Blue', 'Neon_Purple'],
    Fur: ['Black', 'White', 'Golden', 'Tan', 'Cream'],
    Clothes: ['Hoodie', 'Tuxedo', 'Armor', 'Space_Suit', 'Hawaiian'],
    Eyes: ['Normal', 'Sunglasses', 'Laser', 'Heart_Eyes', 'Cyber_Visor'],
    Mouth: ['Smile', 'Grin', 'Cigar', 'Bone', 'Pizza'],
    Hat: ['Crown', 'Beanie', 'Top_Hat', 'Cap', 'Halo'],
    Accessory: ['Gold_Chain', 'Bandana', 'Bow_Tie', 'None', 'Scarf']
  };

  const generateItems = (col) => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: `${col.id}-${i}`,
      name: `${col.name} #${Math.floor(Math.random() * 9000) + 1000}`,
      price: Math.floor(Math.random() * 500) + 50,
      traits: {
        Background: sampleTraits.Background[Math.floor(Math.random() * sampleTraits.Background.length)],
        Fur: sampleTraits.Fur[Math.floor(Math.random() * sampleTraits.Fur.length)],
        Clothes: sampleTraits.Clothes[Math.floor(Math.random() * sampleTraits.Clothes.length)],
        Eyes: sampleTraits.Eyes[Math.floor(Math.random() * sampleTraits.Eyes.length)],
        Mouth: sampleTraits.Mouth[Math.floor(Math.random() * sampleTraits.Mouth.length)],
        Hat: sampleTraits.Hat[Math.floor(Math.random() * sampleTraits.Hat.length)],
        Accessory: sampleTraits.Accessory[Math.floor(Math.random() * sampleTraits.Accessory.length)],
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <Loader className="text-doge animate-spin" size={48} />
      </div>
    );
  }

  if (selectedCollection) {
    const items = generateItems(selectedCollection);
    return (
      <div className="p-8 space-y-8 animate-fade-in pb-32">
        <button
          onClick={() => setSelectedCollection(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold"
        >
          <ChevronLeft size={20} /> Back to Collections
        </button>

        <div className="flex items-center gap-6">
           <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-doge/20 to-purple-600/20 flex items-center justify-center overflow-hidden border-none shrink-0" style={{ boxShadow: '0 0 20px rgba(251,191,36,0.3)' }}>
             {selectedCollection.id === 'doge-master' ? (
               <div className="w-full h-full p-0">
                  <img src={DogeMasterLogo} alt={selectedCollection.name} className="w-full h-full object-cover scale-110" />
               </div>
             ) : (
               <span className="text-4xl font-black text-doge">{selectedCollection.symbol || selectedCollection.name[0]}</span>
             )}
           </div>
           <div>
             <h2 className="text-4xl font-black tracking-tighter">{selectedCollection.name}</h2>
             <div className="flex gap-4 mt-2 text-sm text-gray-500 font-bold">
               <span>Supply: {(selectedCollection.totalSupply || selectedCollection.supply || 0).toLocaleString()}</span>
               <span>{(selectedCollection.categories || []).length} traits</span>
               <span className="text-doge">Floor: Ð {selectedCollection.mintPrice || 100}</span>
             </div>
             <p className="text-xs text-gray-600 mt-1 max-w-md">{selectedCollection.description}</p>
           </div>
        </div>

        <div className="h-px bg-white/5 w-full" />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-[#111] border border-white/5 rounded-2xl p-3 hover:border-doge/30 transition-all group relative">
               <div className="aspect-square bg-[#151b28] rounded-xl mb-3 overflow-hidden relative">
                 {/* Dynamic Layered NFT Rendering */}
                 {selectedCollection.id === 'doge-master' ? (
                   <>
                     {/* Background */}
                     <img src={`${ASSET_BASE}/assets/collections/${selectedCollection.id}/traits/Background/${item.traits.Background?.replace(/ /g, '_')}.svg`} className="absolute inset-0 w-full h-full object-cover" />
                     {/* Fur (Body + Head) */}
                     <img src={`${ASSET_BASE}/assets/collections/${selectedCollection.id}/traits/Fur/${item.traits.Fur?.replace(/ /g, '_')}.svg`} className="absolute inset-0 w-full h-full object-cover z-10" />
                     {/* Clothes */}
                     <img src={`${ASSET_BASE}/assets/collections/${selectedCollection.id}/traits/Clothes/${item.traits.Clothes?.replace(/ /g, '_')}.svg`} className="absolute inset-0 w-full h-full object-cover z-20" />
                     {/* Eyes */}
                     <img src={`${ASSET_BASE}/assets/collections/${selectedCollection.id}/traits/Eyes/${item.traits.Eyes?.replace(/ /g, '_')}.svg`} className="absolute inset-0 w-full h-full object-cover z-30" />
                     {/* Mouth */}
                     <img src={`${ASSET_BASE}/assets/collections/${selectedCollection.id}/traits/Mouth/${item.traits.Mouth?.replace(/ /g, '_')}.svg`} className="absolute inset-0 w-full h-full object-cover z-30" />
                     {/* Hat */}
                     <img src={`${ASSET_BASE}/assets/collections/${selectedCollection.id}/traits/Hat/${item.traits.Hat?.replace(/ /g, '_')}.svg`} className="absolute inset-0 w-full h-full object-cover z-40" />
                     {/* Accessory */}
                     <img src={`${ASSET_BASE}/assets/collections/${selectedCollection.id}/traits/Accessory/${item.traits.Accessory?.replace(/ /g, '_')}.svg`} className="absolute inset-0 w-full h-full object-cover z-50" />
                   </>
                 ) : (
                   <div className="w-full h-full flex items-center justify-center">
                     <span className="text-5xl font-black text-white/10 group-hover:text-doge/30 transition-colors">{selectedCollection.symbol || 'Ð'}</span>
                   </div>
                 )}
               </div>
               <div className="flex justify-between items-end">
                 <div>
                   <p className="font-bold text-sm text-gray-400">{item.name}</p>
                   <p className="font-black text-white">Ð {item.price}</p>
                 </div>
                 <button className="bg-white/10 p-2 rounded-lg text-white hover:bg-doge hover:text-black transition-all">
                   <ShoppingCart size={16} />
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fade-in pb-32">
      {/* Header / Search */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-center font-bold">
          Error: {error} <br/>
          <span className="text-xs opacity-70">API: {API_BASE}/collections</span>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-gray-500 group-focus-within:text-doge transition-colors" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-doge/50 focus:shadow-[0_0_20px_rgba(251,191,36,0.1)] transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchCollections}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 font-bold text-sm transition-all text-gray-400 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-6 py-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 font-bold text-sm transition-all text-gray-400 hover:text-white">
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      {/* Trending Collections */}
      <div className="space-y-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <TrendingUp className="text-doge" /> Trending Collections
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((col) => (
            <div
              key={col.id}
              onClick={() => setSelectedCollection(col)}
              className="group bg-[#111] border border-white/5 rounded-3xl p-4 hover:border-doge/30 transition-all hover:shadow-[0_0_30px_rgba(251,191,36,0.1)] hover:-translate-y-1 cursor-pointer"
            >
              <div className="h-48 w-full bg-gradient-to-br from-doge/10 to-purple-600/10 rounded-2xl mb-4 overflow-hidden relative flex items-center justify-center">
                 {col.id === 'doge-master' ? (
                   <img src={DogeMasterLogo} alt={col.name} className="w-full h-full object-cover opacity-100 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                 ) : (
                   <span className="text-6xl font-black text-white/10 group-hover:text-doge/30 transition-all duration-500 group-hover:scale-110">
                     {col.symbol || col.name[0]}
                   </span>
                 )}

                 <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black border border-white/10">
                   {(col.totalSupply || col.supply || 0).toLocaleString()} NFTs
                 </div>
              </div>
              <div className="flex justify-between items-start px-2">
                <div>
                  <h4 className="font-black text-lg group-hover:text-doge transition-colors">{col.name}</h4>
                  <p className="text-xs text-gray-500 font-bold">{(col.categories || []).length} trait categories</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mint</p>
                  <p className="font-black text-doge">Ð {col.mintPrice || 100}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-600 font-bold">
                No collections found matching "{searchTerm}"
            </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
