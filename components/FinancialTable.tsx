import React from 'react';
import { FinancialMetric } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FinancialTableProps {
  title: string;
  data: FinancialMetric[];
}

const FinancialTable: React.FC<FinancialTableProps> = ({ title, data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-950/30">
            <tr>
              <th className="px-6 py-3 font-medium">Metric</th>
              <th className="px-6 py-3 font-medium text-right">Value</th>
              <th className="px-6 py-3 font-medium text-center">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-300">{item.label}</td>
                <td className="px-6 py-4 text-right font-mono text-slate-300">{item.value}</td>
                <td className="px-6 py-4 flex justify-center">
                  {item.trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
                  {item.trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
                  {(!item.trend || item.trend === 'neutral') && <Minus size={16} className="text-slate-600" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialTable;
