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
          className="w-full bg-doge text-black py-4 rounded-2xl font-black text-lg shadow-xl shadow-doge/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <Wallet size={20} /> Connect Doge Wallet
        </button>
      </div>
    </div>
  );
