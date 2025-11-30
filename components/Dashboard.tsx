import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, RefreshCw, ArrowUpRight, ArrowDownRight, ExternalLink, Activity, Globe } from 'lucide-react';
import { StockData, ChartPoint, LoadingState } from '../types';
import { fetchStockOverview, generateIntradayChart } from '../services/geminiService';
import StockChart from './StockChart';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  symbol: string;
}

const Dashboard: React.FC<DashboardProps> = ({ symbol }) => {
  const [data, setData] = useState<StockData | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [searchInput, setSearchInput] = useState(symbol);
  const [livePrice, setLivePrice] = useState<number>(0);
  
  // Ref to manage live simulation interval
  const simulationInterval = useRef<number | null>(null);

  const loadStock = useCallback(async (sym: string) => {
    setStatus(LoadingState.LOADING);
    if (simulationInterval.current) window.clearInterval(simulationInterval.current);
    
    try {
      const stockData = await fetchStockOverview(sym);
      setData(stockData);
      setLivePrice(stockData.price);

      const chart = await generateIntradayChart(sym, stockData.price);
      setChartData(chart);
      
      setStatus(LoadingState.SUCCESS);
    } catch (e) {
      console.error(e);
      setStatus(LoadingState.ERROR);
    }
  }, []);

  useEffect(() => {
    loadStock(symbol);
    setSearchInput(symbol);
  }, [symbol, loadStock]);

  // Simulate "Tick-by-Tick" updates locally for visual effect
  useEffect(() => {
    if (status === LoadingState.SUCCESS && data) {
      simulationInterval.current = window.setInterval(() => {
        setLivePrice(prev => {
          const volatility = prev * 0.0005; // 0.05% fluctuation
          const change = (Math.random() - 0.5) * volatility;
          return prev + change;
        });
      }, 2000);
    }
    return () => {
      if (simulationInterval.current) window.clearInterval(simulationInterval.current);
    };
  }, [status, data]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      loadStock(searchInput.trim());
    }
  };

  const isPositive = data ? data.change >= 0 : true;

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-900 relative">
      {/* Header / Search */}
      <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search symbol (e.g. AAPL, BTC)..."
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
          />
        </form>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">Market Open</span>
          </div>
          <button 
            onClick={() => loadStock(data?.symbol || symbol)}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${status === LoadingState.LOADING ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {status === LoadingState.ERROR && (
           <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl">
             Failed to load data. Please try searching again.
           </div>
        )}

        {status === LoadingState.SUCCESS && data && (
          <>
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Activity size={48} />
                </div>
                <h2 className="text-slate-400 text-sm font-medium mb-1">Current Price</h2>
                <div className="flex items-end space-x-2">
                  <span className="text-4xl font-bold text-white tracking-tight">
                    ${livePrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 mb-2">{data.currency}</span>
                </div>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <h2 className="text-slate-400 text-sm font-medium mb-1">Daily Change</h2>
                <div className={`flex items-center space-x-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                  <span className="text-3xl font-bold">
                    {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}
                  </span>
                  <span className="text-sm font-medium bg-slate-900/50 px-2 py-1 rounded-lg">
                    {data.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

               <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <h2 className="text-slate-400 text-sm font-medium mb-1">Symbol</h2>
                <div className="text-3xl font-bold text-white">{data.symbol}</div>
                <div className="text-slate-500 text-sm">Nasdaq • Real-time</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl border border-blue-500/50 text-white shadow-lg shadow-blue-900/20">
                <h2 className="text-blue-100 text-sm font-medium mb-1">AI Insight</h2>
                <div className="text-sm font-medium leading-relaxed opacity-90 line-clamp-3">
                   Analyze trends instantly with Gemini 2.5 Flash.
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-200">Price Performance</h3>
                  <div className="flex space-x-2">
                    {['1H', '1D', '1W', '1M', '1Y'].map(range => (
                      <button key={range} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${range === '1D' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <StockChart data={chartData} color={isPositive ? '#10b981' : '#ef4444'} />
              </div>

              {/* AI Analysis / News Panel */}
              <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 overflow-hidden flex flex-col h-96">
                <div className="flex items-center space-x-2 mb-4">
                  <Globe className="text-blue-400 w-5 h-5" />
                  <h3 className="text-lg font-semibold text-slate-200">Market Intelligence</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                  <div className="prose prose-invert prose-sm">
                    <ReactMarkdown>{data.summary}</ReactMarkdown>
                  </div>
                  
                  {data.groundingSources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Sources</h4>
                      <ul className="space-y-2">
                        {data.groundingSources.map((source, idx) => (
                          <li key={idx}>
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-xs text-blue-400 hover:text-blue-300 transition-colors truncate"
                            >
                              <ExternalLink size={12} />
                              <span className="truncate">{source.title}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {status === LoadingState.IDLE && (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500">
            <Activity size={64} className="mb-4 opacity-20" />
            <p className="text-lg">Search for a symbol to begin analysis</p>
          </div>
        )}
        
        {status === LoadingState.LOADING && (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-slate-400 animate-pulse">Consulting Gemini Market Minds...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;