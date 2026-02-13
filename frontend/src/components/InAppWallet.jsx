import React, { useState, useEffect } from 'react';
import { Wallet, Key, Send, Download, Copy, RefreshCw, Eye, EyeOff, LogOut } from 'lucide-react';
import * as DogeWallet from '../utils/doge-wallet';

const InAppWallet = ({ onConnect, onDisconnect, isOpen, onClose }) => {
  const [wallet, setWallet] = useState(null); // { address, privateKey }
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [importKey, setImportKey] = useState('');
  const [view, setView] = useState('main'); // main, create, import, send
  const [showKey, setShowKey] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [txStatus, setTxStatus] = useState(null);

  // Load wallet from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lazy_doge_wallet');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWallet(parsed);
        fetchBalance(parsed.address);
        onConnect(parsed); // Pass full wallet object
      } catch (e) {
        console.error("Failed to load wallet", e);
      }
    }
  }, []);

  const fetchBalance = async (addr) => {
    if (!addr) return;
    setLoading(true);
    try {
      const bal = await DogeWallet.getBalance(addr);
      setBalance(Number(bal) || 0);
    } catch (err) {
      console.error("Balance fetch failed", err);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const newWallet = DogeWallet.createWallet();
    saveWallet(newWallet);
  };

  const handleImport = () => {
    try {
      const imported = DogeWallet.importWallet(importKey.trim());
      saveWallet(imported);
    } catch (err) {
      alert("Invalid Private Key");
    }
  };

  const saveWallet = (w) => {
    setWallet(w);
    localStorage.setItem('lazy_doge_wallet', JSON.stringify(w));
    localStorage.setItem('wallet_mode', 'lazy'); // Ensure mode is saved!
    setView('main');
    fetchBalance(w.address);
    onConnect(w);
  };

  const handleLogout = () => {
    localStorage.removeItem('lazy_doge_wallet');
    setWallet(null);
    setBalance(0);
    onDisconnect();
    setView('main');
  };

  const handleSend = async () => {
    if (!wallet || !sendTo || !sendAmount) return;
    setTxStatus('sending');
    try {
      const sats = Math.floor(parseFloat(sendAmount) * 100000000);
      const txid = await DogeWallet.sendTransaction(wallet.privateKey, sendTo, sats);
      setTxStatus('success');
      alert(`Sent! TX: ${txid}`);
      setSendTo('');
      setSendAmount('');
      fetchBalance(wallet.address);
    } catch (err) {
      console.error(err);
      setTxStatus('error');
      alert(`Failed: ${err.message}`);
    } finally {
      setTxStatus(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  if (!isOpen && !wallet) return null; // Only hide if no wallet and not mandated to be open? 
  // Actually usually this runs inside a modal or sidebar. For now, let's assume it renders in a modal container provided by parent or is always visible in sidebar?
  // User asked for "Connect" -> options.
  
  // If no wallet is set, show Create/Import options
  if (!wallet) {
    return (
      <div className="p-8 bg-[#111] text-white rounded-3xl w-full max-w-sm mx-auto shadow-2xl flex flex-col items-center justify-center text-center animate-fade-in min-h-[400px]">
        <h3 className="text-2xl font-black mb-8 flex items-center gap-3 justify-center">
          <Wallet className="text-doge" size={28} /> Doge Wallet
        </h3>
        
        {view === 'main' && (
          <div className="space-y-6 w-full">
            <button onClick={() => {
              if (window.confirm('⚠️ Generate new Dogecoin wallet?\n\nYour private key will be stored in this browser.\nBack it up immediately!\n\nContinue?')) {
                handleCreate();
              }
            }} className="w-full py-6 bg-doge text-black rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-105 transition-all text-lg shadow-lg shadow-doge/20">
              <Sparkles size={24} /> CREATE WALLET
            </button>
            <button onClick={() => setView('import')} className="w-full py-5 bg-white/5 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-base border border-white/5">
              <Download size={22} /> IMPORT KEY
            </button>
          </div>
        )}

        {view === 'import' && (
          <div className="space-y-6 w-full animate-fade-in">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Enter WIF Private Key</label>
              <textarea 
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
                placeholder="Paste key here..."
                className="w-full bg-black/50 p-5 rounded-2xl text-xs font-mono border border-white/10 focus:border-doge/50 outline-none h-32 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleImport} className="flex-1 py-4 bg-doge text-black rounded-xl font-black text-sm">IMPORT</button>
              <button onClick={() => setView('main')} className="px-6 py-4 bg-white/5 rounded-xl text-gray-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Wallet View
  return (
    <div className="bg-[#111] text-white w-full h-full flex flex-col">
       {/* Header */}
       <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#151515]">
         <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-full bg-doge flex items-center justify-center">
             <span className="text-black font-black text-xs">Ð</span>
           </div>
           <span className="font-bold text-sm">Doge Wallet</span>
         </div>
         <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors">
           <LogOut size={16} />
         </button>
       </div>

       {/* Balance */}
       <div className="p-8 text-center space-y-2">
         <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Total Balance</span>
         <div className="flex items-center justify-center gap-2">
           <h2 className="text-4xl font-black tracking-tighter text-white">{balance.toFixed(2)}</h2>
           <span className="text-xl font-black text-doge">DOGE</span>
         </div>
         <button onClick={() => fetchBalance(wallet.address)} className="text-gray-500 hover:text-white transition-colors">
           <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
         </button>
       </div>

       {/* Actions */}
       <div className="grid grid-cols-2 gap-4 px-6 mb-8">
         <button onClick={() => setView('receive')} className="py-3 bg-white/5 rounded-xl font-bold hover:bg-white/10 flex flex-col items-center gap-1">
           <Download size={20} className="text-doge" />
           <span className="text-[10px] uppercase">Receive</span>
         </button>
         <button onClick={() => setView('send')} className="py-3 bg-white/5 rounded-xl font-bold hover:bg-white/10 flex flex-col items-center gap-1">
           <Send size={20} className="text-doge" />
           <span className="text-[10px] uppercase">Send</span>
         </button>
       </div>

       {/* Content Area */}
       <div className="flex-1 bg-black/20 p-6 overflow-y-auto">
         {view === 'receive' && (
           <div className="text-center space-y-4 animate-scale-in">
             <div className="bg-white p-2 rounded-xl inline-block">
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${wallet.address}`} alt="QR" className="rounded-lg" />
             </div>
             <div className="bg-white/5 p-3 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-white/10" onClick={() => copyToClipboard(wallet.address)}>
               <span className="font-mono text-[10px] text-gray-400 break-all">{wallet.address}</span>
               <Copy size={12} className="shrink-0 text-doge" />
             </div>
             <p className="text-xs text-gray-500">Send DOGE only to this address.</p>
           </div>
         )}

         {view === 'send' && (
           <div className="space-y-4 animate-scale-in">
             <div className="space-y-1">
               <label className="text-[10px] uppercase font-black text-gray-500">Recipient Address</label>
               <input 
                 value={sendTo}
                 onChange={(e) => setSendTo(e.target.value)}
                 className="w-full bg-black/50 p-3 rounded-xl text-xs font-mono border border-white/10 focus:border-doge/50 outline-none"
                 placeholder="D..."
               />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] uppercase font-black text-gray-500">Amount (DOGE)</label>
               <div className="relative">
                 <input 
                   type="number"
                   value={sendAmount}
                   onChange={(e) => setSendAmount(e.target.value)}
                   className="w-full bg-black/50 p-3 rounded-xl text-sm font-bold border border-white/10 focus:border-doge/50 outline-none"
                   placeholder="0.00"
                 />
                 <span className="absolute right-3 top-3 text-xs font-black text-gray-500">DOGE</span>
               </div>
             </div>
             <button 
               onClick={handleSend}
               disabled={txStatus === 'sending'}
               className="w-full py-4 bg-doge text-black rounded-xl font-black mt-4 disabled:opacity-50"
             >
               {txStatus === 'sending' ? 'SENDING...' : 'CONFIRM SEND'}
             </button>
           </div>
         )}
         
         {view === 'main' && (
            <div className="space-y-4">
               <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                 <div className="flex justify-between items-center mb-2">
                   <h4 className="text-red-400 font-bold text-xs">Private Key</h4>
                   <button onClick={() => setShowKey(!showKey)}>
                     {showKey ? <EyeOff size={14} className="text-red-400" /> : <Eye size={14} className="text-red-400" />}
                   </button>
                 </div>
                 {showKey ? (
                   <p className="font-mono text-[10px] text-red-300 break-all bg-black/20 p-2 rounded selectable" onClick={() => copyToClipboard(wallet.privateKey)}>
                     {wallet.privateKey}
                   </p>
                 ) : (
                   <p className="text-[10px] text-gray-500 italic">Hidden for security</p>
                 )}
               </div>
            </div>
         )}
       </div>
    </div>
  );
};

// Simple Icon component fallback if needed
const Sparkles = ({size}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;

export default InAppWallet;
