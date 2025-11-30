import React from 'react';
import { WatchListItem } from '../types';
import { TrendingUp, TrendingDown, LayoutDashboard, PieChart, Newspaper, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  watchlist: WatchListItem[];
  onSelect: (symbol: string) => void;
  currentSymbol: string;
}

const Sidebar: React.FC<SidebarProps> = ({ watchlist, onSelect, currentSymbol }) => {
  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex sticky top-0">
      <div className="p-6 flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          NovaTrade
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>
        <button className="flex items-center space-x-3 w-full px-4 py-3 text-slate-300 bg-slate-800 rounded-xl transition-colors">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>
        <button className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-xl transition-colors">
          <PieChart size={20} />
          <span>Portfolio</span>
        </button>
        <button className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 rounded-xl transition-colors">
          <Newspaper size={20} />
          <span>News</span>
        </button>

        <div className="mt-8 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Watchlist</div>
        <div className="space-y-1">
          {watchlist.map((item) => (
            <button
              key={item.symbol}
              onClick={() => onSelect(item.symbol)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border ${
                currentSymbol === item.symbol 
                  ? 'bg-blue-600/10 border-blue-600/30 text-blue-400' 
                  : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold text-sm">{item.symbol}</span>
                <span className="text-xs opacity-70">{item.name}</span>
              </div>
              <div className={`text-xs font-medium ${item.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
              </div>
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center space-x-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;