import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  isCurrency?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, trend, isCurrency }) => {
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  // Helper to format values
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') return val.toLocaleString();
    
    // If string is strictly numeric digits (like "145840113213"), format it
    if (typeof val === 'string' && /^\d+(\.\d+)?$/.test(val)) {
        return parseFloat(val).toLocaleString();
    }
    return val;
  };

  const displayValue = formatValue(value);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-4xl font-bold text-white font-mono truncate max-w-full tracking-tight">
           {isCurrency && '$'}{displayValue}
        </div>
        {subValue && (
          <div className={`flex items-center text-sm font-medium mt-1 ${isUp ? 'text-green-500' : isDown ? 'text-red-500' : 'text-slate-400'}`}>
            {isUp && <ArrowUpRight size={16} className="mr-1" />}
            {isDown && <ArrowDownRight size={16} className="mr-1" />}
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;