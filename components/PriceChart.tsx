import React, { useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimeRange, StockData } from '../types';

interface PriceChartProps {
  stocks: StockData[];
  timeRange: TimeRange;
}

// Map time ranges to simulated data points (approx trading days)
const RANGE_POINTS: Record<TimeRange, number> = {
  '1M': 22,
  '3M': 66,
  '6M': 132,
  '1Y': 252,
  '2Y': 504,
  '3Y': 756,
  '5Y': 1260
};

// Expanded Palette to prevent collisions for up to 12 items
const CHART_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#d946ef", // Fuchsia
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#14b8a6"  // Teal
];

const generateData = (stocks: StockData[], range: TimeRange) => {
  const points = RANGE_POINTS[range];
  const data = [];
  
  // We will generate a single timeline.
  // For comparison, we usually normalize to percentage change from start (0%).
  
  // Initial previous values for random walk
  const prevPrices = stocks.map(s => s.price);
  const volatilities = stocks.map(s => s.price * 0.02); // 2% daily vol

  // We build backwards from today to ensure end price matches current price
  
  for (let i = 0; i < points; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const point: any = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: range === '1M' ? undefined : '2-digit' }),
    };

    stocks.forEach((stock, idx) => {
        let price = prevPrices[idx];
        if (i > 0) {
            // Reverse walk
            const change = (Math.random() - 0.48) * volatilities[idx]; 
            price = price - change;
            prevPrices[idx] = price;
        }
        // If multiple stocks, use percentage change relative to START of graph (which is the last calculated point in reverse loop)
        // Wait, to do percentage change correctly from start date, we need to know start price first.
        // Simplified: Let's just store raw price here, and normalize in the chart if needed, 
        // OR better: Just show normalized % change curve where T0 = 0%.
        // But since we generate backwards, T-End is known (current).
        // Let's store Price.
        point[stock.symbol] = parseFloat(price.toFixed(2));
    });

    data.unshift(point);
  }

  // Normalize data if comparison (more than 1 stock)
  if (stocks.length > 1) {
      const startPrices: Record<string, number> = {};
      stocks.forEach(s => {
          startPrices[s.symbol] = data[0][s.symbol];
      });

      return data.map(pt => {
          const newPt: any = { date: pt.date };
          stocks.forEach(s => {
              const start = startPrices[s.symbol];
              const current = pt[s.symbol];
              newPt[s.symbol] = parseFloat(((current - start) / start * 100).toFixed(2));
          });
          return newPt;
      });
  }

  return data;
};

const PriceChart: React.FC<PriceChartProps> = ({ stocks, timeRange }) => {
  const data = useMemo(() => generateData(stocks, timeRange), [stocks, timeRange]);
  const isMulti = stocks.length > 1;

  if (isMulti) {
      return (
        <div className="h-[400px] w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-sm font-semibold text-slate-300">Performance Comparison (%)</h3>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">{timeRange}</span>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke="#94a3b8" 
                            tick={{fontSize: 12, fill: '#94a3b8'}} 
                            tickLine={false} 
                            axisLine={false} 
                            minTickGap={40}
                            dy={10}
                        />
                        <YAxis 
                            stroke="#94a3b8" 
                            tick={{fontSize: 12, fill: '#94a3b8'}} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(val) => `${val}%`} 
                            width={45} 
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                            itemStyle={{ fontSize: 12 }}
                            formatter={(val: number) => [`${val > 0 ? '+' : ''}${val}%`]}
                        />
                        <Legend />
                        {stocks.map((stock, idx) => (
                            <Line 
                                key={stock.symbol}
                                type="monotone" 
                                dataKey={stock.symbol} 
                                stroke={CHART_COLORS[idx % CHART_COLORS.length]} 
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
      );
  }

  // Single Stock View (Area Chart)
  const stock = stocks[0];
  const isPositive = data[data.length - 1][stock.symbol] >= data[0][stock.symbol];
  const change = stock.price - data[0][stock.symbol]; // Approx
  
  return (
    <div className="h-[400px] w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300">Price Action</h3>
            <span className={`text-xs font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.changePercent.toFixed(2)}%) <span className="text-slate-500">past {timeRange}</span>
            </span>
        </div>
        <div className="flex gap-2">
           <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">Daily Interval</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
            <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                tick={{fontSize: 12, fill: '#94a3b8'}} 
                tickLine={false} 
                axisLine={false} 
                minTickGap={40}
                dy={10}
            />
            <YAxis 
                domain={['auto', 'auto']} 
                stroke="#94a3b8" 
                tick={{fontSize: 12, fill: '#94a3b8'}} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${value}`} 
                width={60} 
            />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']} />
            <Area type="monotone" dataKey={stock.symbol} stroke={isPositive ? "#10b981" : "#ef4444"} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;