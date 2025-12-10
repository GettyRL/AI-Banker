import React, { useState } from 'react';
import { Search, Calendar, Activity, UploadCloud, FileText, X, ExternalLink, Zap, BarChart3, PieChart } from 'lucide-react';
import { TimeRange, UploadedFile } from '../types';

interface SidebarProps {
  onSearch: (ticker: string) => void;
  isLoading: boolean;
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onFilesSelected: (files: UploadedFile[]) => void;
}

const POPULAR_STOCKS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "BRK.B", "LLY", "V", 
  "JPM", "XOM", "WMT", "UNH", "MA", "PG", "JNJ", "AVGO", "HD", "ORCL",
  "COST", "ABBV", "KO", "PEP", "BAC", "NFLX", "AMD", "CRM", "ADBE", "DIS"
];

const TIME_RANGES: TimeRange[] = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y'];

const Sidebar: React.FC<SidebarProps> = ({ 
  onSearch, 
  isLoading, 
  selectedTimeRange, 
  onTimeRangeChange,
  onFilesSelected
}) => {
  const [ticker, setTicker] = useState('AAPL');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onSearch(ticker);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Split to get just the base64 data, removing the "data:application/pdf;base64," prefix
        const base64Data = result.split(',')[1];
        
        const newFile: UploadedFile = {
          name: file.name,
          mimeType: file.type,
          data: base64Data
        };

        const updatedFiles = [...uploadedFiles, newFile];
        setUploadedFiles(updatedFiles);
        onFilesSelected(updatedFiles);
      };
      
      reader.readAsDataURL(file);
    }
    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    const updated = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updated);
    onFilesSelected(updated);
  };

  return (
    <div className="w-full md:w-72 bg-slate-900 border-r border-slate-800 p-4 flex flex-col h-full text-slate-300 overflow-y-auto">
      <div className="mb-6 flex items-center gap-2 text-white shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Activity size={20} />
        </div>
        <span className="font-bold text-lg tracking-tight">AI Banker</span>
      </div>

      {/* App Intro / Capabilities */}
      <div className="mb-8 p-3 bg-slate-950/50 rounded-lg border border-slate-800/50">
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Skip the manual spreadsheeting. 
          <span className="text-slate-300 font-medium block mt-1">
            Supercharge your investment workflow:
          </span>
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-xs text-slate-400">
             <Zap size={12} className="text-yellow-500 shrink-0" />
             <span>Real-time market comparison</span>
          </li>
          <li className="flex items-center gap-2 text-xs text-slate-400">
             <FileText size={12} className="text-blue-400 shrink-0" />
             <span>Instant report analysis</span>
          </li>
          <li className="flex items-center gap-2 text-xs text-slate-400">
             <PieChart size={12} className="text-green-500 shrink-0" />
             <span>Auto-generated valuation models</span>
          </li>
        </ul>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
          Market Data
        </label>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Enter tickers (e.g. AAPL) or company names. Use commas to separate multiple companies for comparison. Press <strong className="text-slate-200">Enter</strong> to execute analysis.
        </p>
        <form onSubmit={handleSubmit} className="relative">
          <input
            list="stock-tickers"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md py-2 pl-3 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono placeholder-slate-600"
            placeholder="Companies, sectors, country..."
          />
          <datalist id="stock-tickers">
            {POPULAR_STOCKS.map(s => <option key={s} value={s} />)}
          </datalist>
          <button 
            type="submit"
            className="absolute right-2 top-2.5 text-slate-500 hover:text-blue-400 transition-colors"
            disabled={isLoading}
          >
            <Search size={16} />
          </button>
        </form>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
          Timeframe
        </label>
        <div className="grid grid-cols-4 gap-2">
           {TIME_RANGES.map(range => (
             <button
               key={range}
               onClick={() => onTimeRangeChange(range)}
               className={`text-xs py-1.5 px-1 rounded-md transition-all ${
                 selectedTimeRange === range 
                   ? 'bg-blue-600 text-white font-medium shadow-sm' 
                   : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800 hover:border-slate-700'
               }`}
             >
               {range}
             </button>
           ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Research Materials</span>
          <UploadCloud size={14} />
        </label>
        <div className="bg-slate-950 border border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-blue-500/50 hover:bg-slate-900 transition-all group">
           <input 
             type="file" 
             id="file-upload" 
             className="hidden" 
             accept=".pdf,.csv,.txt,.png,.jpg" 
             onChange={handleFileUpload}
           />
           <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                <FileText size={14} />
             </div>
             <div>
               <span className="text-xs text-slate-400 group-hover:text-slate-300 block font-medium">
                 Upload PDF/CSV Report
               </span>
               <span className="text-[10px] text-slate-500 mt-1 block">
                 Upload financial reports to generate deep analysis
               </span>
             </div>
           </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded p-2 border border-slate-700/50">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={12} className="text-blue-400 shrink-0" />
                  <span className="text-xs text-slate-300 truncate">{file.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(idx)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          System Operational
        </div>
        
        <a 
          href="https://www.linkedin.com/in/gettyrl/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-blue-900/20 mb-2"
        >
          <ExternalLink size={14} />
          Connect with Developer
        </a>
        <p className="text-[10px] text-slate-600 text-center">
          Powered by Gemini 2.5 Flash & 3 Pro
        </p>
      </div>
    </div>
  );
};

export default Sidebar;