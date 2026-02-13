import React, { useState } from 'react';
import axios from 'axios';
import { Plus, Rocket, Image as ImageIcon, CheckCircle, ArrowRight, ArrowLeft, Upload, Layers, Tag } from 'lucide-react';

import { API_BASE } from '../config';

const STEPS = [
  { num: 1, label: 'Details', icon: Tag },
  { num: 2, label: 'Assets', icon: Layers },
  { num: 3, label: 'Launch', icon: Rocket },
];

const Create = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', symbol: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  const handleCreate = async () => {
    if (!formData.name || !formData.symbol) return alert("Name and Symbol are required.");
    setIsCreating(true);
    try {
      const { data } = await axios.post(`${API_BASE}/collections`, formData, { withCredentials: true });
      setCreatedId(data.collectionId);
      setStep(3);
    } catch (err) {
      alert("Creation failed");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-doge/10 rounded-3xl border border-doge/20">
          <Plus className="text-doge" size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">Launch Collection</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Create your own NFT drop</p>
        </div>
      </div>

      <div className="glass rounded-[32px] border border-white/5 overflow-hidden">
        {/* Progress Bar */}
        <div className="flex bg-white/[0.02] border-b border-white/5">
          {STEPS.map((s) => (
            <div key={s.num} className="flex-1 py-4 flex items-center justify-center gap-2 border-r last:border-r-0 border-white/5 relative">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                step >= s.num ? 'bg-doge text-black' : 'bg-white/10 text-gray-500'
              }`}>
                {step > s.num ? <CheckCircle size={14} /> : s.num}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:inline ${
                step >= s.num ? 'text-white' : 'text-gray-600'
              }`}>
                {s.label}
              </span>
              {step === s.num && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-doge" />}
            </div>
          ))}
        </div>

        <div className="p-8 lg:p-10">
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Collection Name *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    placeholder="e.g. AstroDoge Club"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-doge/50 transition-all font-bold placeholder:text-gray-700"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Symbol *</label>
                  <input 
                    type="text" 
                    value={formData.symbol}
                    placeholder="e.g. ADC"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-doge/50 transition-all font-bold placeholder:text-gray-700 uppercase"
                    onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                    maxLength={6}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  value={formData.description}
                  placeholder="Tell the community about your collection..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-doge/50 transition-all font-bold placeholder:text-gray-700 h-32 resize-none"
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Live Preview */}
              <div className="glass p-6 rounded-2xl border border-white/5">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-3">Preview</span>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-doge/10 rounded-2xl flex items-center justify-center border border-doge/20">
                    <span className="text-2xl font-black text-doge">{formData.symbol ? formData.symbol.charAt(0) : '?'}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-lg">{formData.name || 'Collection Name'}</h4>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{formData.symbol || 'SYM'} • Doginals</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.symbol}
                className="w-full bg-doge text-black py-4 rounded-2xl font-black text-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next: Upload Assets <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Assets */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="border-2 border-dashed border-white/10 rounded-[28px] p-10 text-center flex flex-col items-center gap-4 hover:border-doge/30 transition-all cursor-pointer group">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-doge/10 transition-all">
                  <Upload className="text-gray-500 group-hover:text-doge transition-all" size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Upload Trait Layers</h3>
                  <p className="text-gray-500 text-sm mt-1">Drag and drop your PNG layers (transparent background)</p>
                </div>
                <div className="text-[10px] bg-white/5 px-4 py-2 rounded-full font-black text-gray-400 uppercase tracking-widest">
                  Supports .ZIP of categorized trait folders
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Format', value: 'PNG / SVG' },
                  { label: 'Max Size', value: '2048×2048' },
                  { label: 'Organization', value: 'folders/traits' },
                ].map((item, i) => (
                  <div key={i} className="glass p-4 rounded-2xl text-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">{item.label}</span>
                    <span className="text-sm font-black text-white">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 text-gray-400 py-4 rounded-2xl font-black hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex-[2] bg-doge text-black py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>Launch Collection <Rocket size={20} /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8 space-y-6 animate-scale-in">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                <CheckCircle className="text-green-500" size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tight">Collection Deployed!</h3>
                <p className="text-gray-500 font-medium max-w-sm mx-auto">
                  <strong className="text-white">{formData.name}</strong> is now live. Collectors can start TraitChasing immediately.
                </p>
                {createdId && (
                  <p className="text-[10px] text-gray-600 font-mono mt-4">
                    ID: {createdId}
                  </p>
                )}
              </div>
              <div className="flex gap-4 justify-center pt-4">
                <button 
                  onClick={() => { setStep(1); setFormData({ name: '', symbol: '', description: '' }); setCreatedId(null); }}
                  className="bg-white/5 border border-white/10 px-8 py-3 rounded-xl font-black text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  Create Another
                </button>
                <button className="bg-doge text-black px-8 py-3 rounded-xl font-black text-sm hover:scale-105 transition-all">
                  View Collection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Create;
