import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { WatchListItem } from './types';

// Mock watchlist for initial state
const INITIAL_WATCHLIST: WatchListItem[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, changePercent: 1.2 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.20, changePercent: 3.5 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 168.90, changePercent: -2.1 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 155.30, changePercent: 0.8 },
  { symbol: 'MSFT', name: 'Microsoft', price: 420.10, changePercent: 1.1 },
];

function App() {
  const [currentSymbol, setCurrentSymbol] = useState<string>('AAPL');
  const [watchlist] = useState<WatchListItem[]>(INITIAL_WATCHLIST);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      <Sidebar 
        watchlist={watchlist} 
        onSelect={setCurrentSymbol} 
        currentSymbol={currentSymbol} 
      />
      
      {/* Mobile Drawer trigger could go here, for now using responsive flex */}
      
      <Dashboard symbol={currentSymbol} />
    </div>
  );
}

export default App;