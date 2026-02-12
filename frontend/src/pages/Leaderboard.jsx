import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Users, Star, Crown, Medal, TrendingUp } from 'lucide-react';

const API_BASE = 'http://localhost:4001/api';

const RANK_STYLES = [
  { bg: 'bg-gradient-to-r from-doge/20 to-transparent', badge: 'bg-doge text-black shadow-lg shadow-doge/30 scale-110', icon: Crown },
  { bg: 'bg-gradient-to-r from-gray-400/10 to-transparent', badge: 'bg-gray-300 text-black', icon: Medal },
  { bg: 'bg-gradient-to-r from-amber-700/10 to-transparent', badge: 'bg-amber-700 text-white', icon: Medal },
];

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/leaderboard`);
        setLeaders(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto w-full animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-doge/10 rounded-3xl border border-doge/20">
            <Trophy className="text-doge" size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Top Collectors</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Leaderboard • Live Rankings</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-doge bg-doge/10 px-4 py-2 rounded-2xl border border-doge/20">
          <TrendingUp size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-doge border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leaders.map((user, index) => {
            const style = RANK_STYLES[index] || { bg: '', badge: 'bg-white/5 text-gray-500', icon: null };
            return (
              <div 
                key={user.userId} 
                className={`glass p-5 rounded-2xl flex items-center gap-5 border border-white/5 transition-all hover:border-doge/20 group ${style.bg}`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${style.badge}`}>
                  {index < 3 && style.icon ? <style.icon size={20} /> : index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-0.5">
                    {index === 0 ? '👑 Alpha Doge' : index === 1 ? '🥈 Silver Shibe' : index === 2 ? '🥉 Bronze Pup' : `Rank #${index + 1}`}
                  </span>
                  <span className="text-lg font-mono font-bold text-white group-hover:text-doge transition-colors truncate block">
                    {user.userId}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-0.5">Minted</span>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-2xl font-black text-white">{user.totalMinted}</span>
                    <Star className="text-doge fill-doge" size={16} />
                  </div>
                </div>
              </div>
            );
          })}

          {leaders.length === 0 && (
            <div className="glass p-16 rounded-[32px] border border-white/5 text-center flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
                <Users className="text-gray-500" size={40} />
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">No Rankings Yet</h3>
                <p className="text-gray-500 font-medium max-w-sm">Be the first to mint and claim the #1 spot on the leaderboard!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
