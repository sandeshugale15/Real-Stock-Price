import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartPoint } from '../types';

interface StockChartProps {
  data: ChartPoint[];
  color?: string;
}

const StockChart: React.FC<StockChartProps> = ({ data, color = "#10b981" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700">
        <span className="text-slate-400">No chart data available</span>
      </div>
    );
  }

  return (
    <div className="h-80 w-full bg-slate-800/30 rounded-xl p-4 border border-slate-700 backdrop-blur-sm">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#94a3b8" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#f1f5f9' }}
            itemStyle={{ color: '#f1f5f9' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;