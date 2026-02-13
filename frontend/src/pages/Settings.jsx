import React, { useState } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, User, Wallet, Bell, Shield, Save, CheckCircle } from 'lucide-react';

import { API_BASE } from '../config';

const SettingsPage = ({ userId, username: initialUsername, walletAddress: initialWallet }) => {
  const [username, setUsername] = useState(initialUsername || '');
  const [walletAddress, setWalletAddress] = useState(initialWallet || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post(`${API_BASE}/user/profile`, { username, walletAddress }, { withCredentials: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const settingsNav = [
    { icon: User, label: "Identity", active: true },
    { icon: Wallet, label: "Wallet" },
    { icon: Bell, label: "Notifications" },
    { icon: Shield, label: "Security" },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto w-full animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <div className="p-4 bg-doge/10 rounded-3xl border border-doge/20">
          <SettingsIcon className="text-doge" size={48} />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight">Settings</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Manage your profile & wallet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="glass p-4 rounded-3xl border border-white/5 h-fit space-y-2">
          {settingsNav.map(item => (
            <div key={item.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${item.active ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Username</label>
              <input 
                type="text" 
                value={username}
                placeholder="LazyShibe_42"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-doge/50 transition-all font-bold placeholder:text-gray-700"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Doge Wallet Address</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={walletAddress}
                  placeholder="D5abc123..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-doge/50 transition-all font-mono text-sm pr-12 placeholder:text-gray-700"
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
                <Wallet className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-doge" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Session: <span className="text-white/30 font-mono">{userId}</span>
                </span>
              </div>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm tracking-wide transition-all ${saved ? 'bg-green-600 text-white' : 'bg-doge text-black shadow-lg shadow-doge/20 hover:scale-105'}`}
              >
                {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-[28px] flex justify-between items-center">
            <div>
              <h4 className="text-red-500 font-bold text-sm uppercase tracking-tight">Reset Session</h4>
              <p className="text-red-500/60 text-[10px] font-medium uppercase tracking-widest">Clears local credits & history</p>
            </div>
            <button 
              onClick={() => { if(window.confirm("This clears everything. Continue?")) window.location.reload(); }}
              className="px-6 py-2 rounded-xl bg-red-500/20 text-red-500 text-xs font-black hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
            >
              RESET
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
