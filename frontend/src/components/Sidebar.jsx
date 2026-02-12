import { 
  Zap, Plus, ImageIcon, BarChart3, Settings, Menu, X, ShoppingBag 
} from 'lucide-react';

const NavItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
      active 
        ? 'bg-doge text-black font-bold shadow-lg shadow-doge/20' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon size={20} />
    {!collapsed && <span className="text-sm tracking-wide">{label}</span>}
  </button>
);

const Sidebar = ({ currentPage, setCurrentPage, collapsed, setCollapsed }) => {
  const navItems = [
    { id: 'workshop', icon: Zap, label: 'Game' },
    { id: 'marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { id: 'create', icon: Plus, label: 'Create' },
    { id: 'gallery', icon: ImageIcon, label: 'My Gallery' },
    { id: 'leaderboard', icon: BarChart3, label: 'Leaderboard' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className={`glass border-r border-white/5 transition-all duration-300 flex flex-col ${!collapsed ? 'w-64' : 'w-20'} p-4 h-screen sticky top-0 shrink-0`}>
      {/* Logo */}
      <div className="flex flex-col items-center gap-1 mb-6 px-2">
        <img 
          src="https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=035" 
          alt="DOGE" 
          className="w-16 h-16 shrink-0 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]"
        />
        {!collapsed && (
          <div className="flex flex-col items-center -mt-1">
            <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
              <span className="text-doge text-3xl">Ð</span> Lazy Mint
            </h1>
            <span className="text-[9px] text-doge/60 font-black tracking-[0.3em] text-center mt-0.5">NFT LAUNCHPAD</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map(item => (
          <NavItem 
            key={item.id}
            icon={item.icon} 
            label={item.label} 
            active={currentPage === item.id} 
            onClick={() => setCurrentPage(item.id)}
            collapsed={collapsed}
          />
        ))}
      </nav>

    </aside>
  );
};

export default Sidebar;
