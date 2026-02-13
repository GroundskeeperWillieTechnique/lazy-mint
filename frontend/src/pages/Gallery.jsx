import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ImageIcon, History, Shield, ExternalLink, Sparkles } from 'lucide-react';

import { API_BASE, ASSET_BASE } from '../config';

const Gallery = () => {
  const [mints, setMints] = useState([]);
  const [traitImages, setTraitImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMints = async () => {
      try {
        const [mintsRes, imgRes] = await Promise.all([
          axios.get(`${API_BASE}/mints`, { withCredentials: true }),
          axios.get(`${API_BASE}/collection/trait-images`)
        ]);
        setMints(mintsRes.data);
        setTraitImages(imgRes.data);
      } catch (err) {
        console.error("Failed to fetch mints", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMints();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-doge/10 rounded-3xl border border-doge/20">
            <ImageIcon className="text-doge" size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Your Collection</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              Personal Collection • {mints.length} Inscribed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
          <Sparkles className="text-doge" size={14} />
          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
            {mints.length > 0 ? 'Active Collector' : 'New Collector'}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-doge border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mints.map((mint, i) => (
            <div 
              key={mint.inscriptionId} 
              className="glass rounded-[28px] overflow-hidden border border-white/5 group hover:border-doge/30 transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="aspect-square bg-white/[0.02] relative p-4 overflow-hidden">
                {/* Background Layer */}
                {traitImages['Background']?.[mint.traits['Background']] && (
                  <img 
                    src={`${ASSET_BASE}${traitImages['Background'][mint.traits['Background']]}`} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                )}
                {/* Composition Layers */}
                <div className="absolute inset-0 w-full h-full">
                  {['Fur', 'Clothes', 'Neck', 'Mouth', 'Eyes', 'Hat'].map(cat => {
                    const url = traitImages[cat]?.[mint.traits[cat]];
                    return url ? (
                      <img 
                        key={cat} 
                        src={`${ASSET_BASE}${url}`} 
                        alt="" 
                        className="absolute inset-0 w-full h-full object-contain drop-shadow-xl z-10" 
                      />
                    ) : null;
                  })}
                </div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-mono text-doge z-20">
                  #{mint.inscriptionId.slice(-6)}
                </div>
              </div>
              <div className="p-5 bg-white/[0.01] border-t border-white/5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-base tracking-tight">Inscription #{mint.inscriptionId.slice(-4)}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {new Date(mint.mintedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-2 bg-doge/10 rounded-lg">
                    <Shield className="text-doge" size={14} />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(mint.traits).map(([k, v]) => (
                    <span key={k} className="text-[9px] font-bold text-gray-400 bg-white/5 px-2 py-1 rounded-md">
                      {v}
                    </span>
                  ))}
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-black transition-all text-gray-400 hover:text-white">
                  VIEW ON CHAIN <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}

          {mints.length === 0 && (
            <div className="col-span-full glass p-16 rounded-[32px] border border-white/5 text-center flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
                <History className="text-gray-500" size={40} />
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">No Inscriptions Yet</h3>
                <p className="text-gray-500 font-medium max-w-sm">Head to the Workshop, shuffle some traits, and mint your first inscription!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Gallery;
