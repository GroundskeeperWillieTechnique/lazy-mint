import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, LockKeyhole, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Workshop from './pages/Workshop';
import Gallery from './pages/Gallery';
import Leaderboard from './pages/Leaderboard';
import Create from './pages/Create';
import SettingsPage from './pages/Settings';
import InAppWallet from './components/InAppWallet';
import Marketplace from './pages/Marketplace';
import * as DogeWalletUtils from './utils/doge-wallet';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [currentPage, setCurrentPage] = useState('workshop');
  const [collapsed, setCollapsed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState({ userId: null, credits: 0, username: '', walletAddress: '', totalMinted: 0 });
  const [collections, setCollections] = useState([]);
  
  // Wallet State
  const [walletMode, setWalletMode] = useState(null); // 'extension' | 'lazy'
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showInAppWallet, setShowInAppWallet] = useState(false);
  const [inAppWalletObject, setInAppWalletObject] = useState(null);

  // Load Lazy Wallet on mount if exists
  useEffect(() => {
    fetchCollections();
    const savedMode = localStorage.getItem('wallet_mode');
    const savedWallet = localStorage.getItem('lazy_doge_wallet');
    
    if (savedMode === 'lazy' && savedWallet) {
      try {
        const parsed = JSON.parse(savedWallet);
        setInAppWalletObject(parsed);
        setIsConnected(true);
        setWalletMode('lazy');
      } catch (e) {
        console.error("Failed to auto-load wallet", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isConnected) fetchSession();
  }, [isConnected]);

  const fetchSession = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/session`, { withCredentials: true });
      setUser(prev => ({ ...prev, ...data }));
    } catch (err) {
      console.error("Session fetch failed", err);
    }
  };

  const fetchCollections = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/collections`);
      setCollections(data);
    } catch (err) { }
  };

  // --- Wallet Logic ---

  // Old handlers removed

  const disconnect = () => {
    setIsConnected(false);
    setWalletMode(null);
    setInAppWalletObject(null);
    localStorage.removeItem('wallet_mode');
    setUser(u => ({ ...u, walletAddress: '' }));
  };

  // Unified Transaction Handler passed to Workshop
  // Unified Transaction Handler passed to Workshop
  const mintTransaction = async (toAddress, amountSats) => {
    if (walletMode === 'extension') {
      const txResult = await window.doge.request({
        method: 'transfer',
        params: { to: toAddress, amount: amountSats }
      });
      return txResult.txid || txResult;
    } else if (walletMode === 'lazy') {
      if (!inAppWalletObject) throw new Error("Wallet not loaded");
      return await DogeWalletUtils.sendTransaction(inAppWalletObject.privateKey, toAddress, amountSats);
    }
    throw new Error("No wallet connected");
  };

  // --- UI Components ---

  const handleConnectDogeWallet = () => {
    setWalletMode('lazy');
    localStorage.setItem('wallet_mode', 'lazy');
    setShowConnectModal(false);
    setShowInAppWallet(true); 
  };

  const ProtectedGate = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-scale-in">
      <div className="relative">
        <div className="absolute -inset-8 bg-doge/10 blur-[60px] rounded-full" />
        <div className="glass p-8 rounded-[40px] border border-doge/20 relative">
          <LockKeyhole className="text-doge mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-black tracking-tight">ACCESS RESTRICTED</h2>
           <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Wallet Connection Required</p>
        </div>
      </div>
      <div className="max-w-md space-y-6">
        <button 
          onClick={() => setShowInAppWallet(true)}
          className="w-full bg-doge text-black py-4 px-8 rounded-2xl font-black text-base md:text-lg shadow-xl shadow-doge/20 hover:scale-105 transition-all flex items-center justify-center gap-3 whitespace-nowrap"
        >
          <Wallet size={20} className="shrink-0" /> Connect Doge Wallet
        </button>
      </div>
    </div>
  );

  const pageTitles = {
    workshop: { title: isConnected ? 'The Workshop' : 'Welcome to Lazy Mint', sub: isConnected ? 'Curate your next legendary mint.' : 'The ultimate NFT launchpad for Dogecoin.' },
    gallery: { title: 'My Collection', sub: 'Your minted inscriptions.' },
    leaderboard: { title: 'Leaderboard', sub: 'Top collectors worldwide.' },
    create: { title: 'Create', sub: 'Launch your own collection.' },
    settings: { title: 'Settings', sub: 'Manage your profile and wallet.' },
    marketplace: { title: 'Marketplace', sub: 'Explore and trade Doginals.' },
  };
  const pageInfo = pageTitles[currentPage] || pageTitles.workshop;

  const setCredits = (c) => setUser(prev => ({ ...prev, credits: c }));

  return (
    <div className="h-screen bg-[#050505] text-white flex overflow-hidden font-sans">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.04),transparent_50%)]">
        {/* Top Bar */}
        <header className="w-full flex justify-between items-center px-8 py-5 backdrop-blur-md sticky top-0 z-10 border-b border-white/[0.03] bg-[#050505]/80">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black tracking-tight">{pageInfo.title}</h2>
            <p className="text-sm text-gray-500 font-medium">{pageInfo.sub}</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => isConnected ? disconnect() : setShowInAppWallet(true)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl transition-all font-black text-sm tracking-wide ${
                isConnected 
                  ? 'glass border-white/10 text-gray-400 hover:text-white' 
                  : 'bg-doge text-black shadow-lg shadow-doge/20 hover:scale-105 active:scale-95'
              }`}
            >
              <Wallet size={16} fill={isConnected ? "none" : "currentColor"} />
              {isConnected ? 'Disconnect' : 'Connect Wallet'}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
           {currentPage === 'workshop' && (
             <Workshop 
               isConnected={isConnected} 
               userId={user.userId} 
               credits={user.credits} 
               setCredits={setCredits} 
               mintTransaction={mintTransaction}
               userAddress={user.walletAddress || (inAppWalletObject ? inAppWalletObject.address : '')}
             />
           )}
           {currentPage === 'gallery' && (isConnected ? <Gallery /> : <ProtectedGate />)}
           {currentPage === 'leaderboard' && <Leaderboard />}
           {currentPage === 'create' && <Create />}
           {currentPage === 'settings' && (isConnected ? <SettingsPage {...user} /> : <ProtectedGate />)}
           {currentPage === 'marketplace' && <Marketplace />}
        </main>

        <footer className="w-full px-8 py-6 flex justify-between items-center text-gray-600 text-[10px] font-black tracking-[0.3em] uppercase border-t border-white/[0.02]">
          <div className="flex items-center gap-4">
            <span className="hover:text-doge cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-doge cursor-pointer transition-colors">Discord</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-doge" />
            <span>Lazy Mint v2.0</span>
          </div>
        </footer>
      </div>

      {showInAppWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
           <div className="relative w-full max-w-sm h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <button 
                onClick={() => setShowInAppWallet(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-white/20"
              >
                <X size={16} />
              </button>
              <InAppWallet 
                isOpen={showInAppWallet} 
                onClose={() => setShowInAppWallet(false)}
                onConnect={(walletObj) => {
                  setInAppWalletObject(walletObj);
                  setIsConnected(true);
                  if(!walletMode) setWalletMode('lazy'); 
                  setUser(u => ({ ...u, walletAddress: walletObj.address }));
                  // Note: InAppWallet component keeps its own state but we sync here.
                }}
                onDisconnect={disconnect}
              />
           </div>
        </div>
      )}
    </div>
  );
}

export default App;
