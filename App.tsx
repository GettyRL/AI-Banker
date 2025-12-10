import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, FileText, Calculator, Loader2, Send, MessageSquare, Scale, Trophy, Sparkles, Download, FileSpreadsheet, FileType, Presentation, CheckCircle2 } from 'lucide-react';
import { jsPDF } from "jspdf";
import PptxGenJS from "pptxgenjs";

import Sidebar from './components/Sidebar';
import AnalysisPanel from './components/AnalysisPanel';
import MetricCard from './components/MetricCard';
import PriceChart from './components/PriceChart';
import FinancialTable from './components/FinancialTable';
import ValuationCard from './components/ValuationCard';

import { fetchStockData, fetchFinancialAnalysis, fetchComparisonAnalysis, askAiBanker } from './services/geminiService';
import { StockData, FinancialHealthData, ValuationData, ComparisonAnalysis, AppTab, TimeRange, UploadedFile } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.PRICE);
  const [tickerInput, setTickerInput] = useState<string>('AAPL');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  
  // Data State
  const [stockData, setStockData] = useState<StockData[]>([]); 
  const [healthData, setHealthData] = useState<FinancialHealthData | null>(null); 
  const [valuationData, setValuationData] = useState<ValuationData | null>(null); 
  const [comparisonData, setComparisonData] = useState<ComparisonAnalysis | null>(null); 
  
  const [currentFiles, setCurrentFiles] = useState<UploadedFile[]>([]);

  // Q&A State
  const [question, setQuestion] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Race condition handling
  const requestRef = useRef<number>(0);

  const loadData = async (input: string) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setLoading(true);
    setTickerInput(input);
    setStockData([]); 
    setAnswer(null); 
    setLastQuestion('');
    setHealthData(null);
    setValuationData(null);
    setComparisonData(null);
    
    try {
      const stocks = await fetchStockData(input);
      if (requestRef.current !== requestId) return;
      setStockData(stocks);
      
      setAnalyzing(true);
      if (stocks.length > 1) {
          const tickers = stocks.map(s => s.symbol);
          fetchComparisonAnalysis(tickers).then(data => {
              if (requestRef.current !== requestId) return;
              setComparisonData(data);
              setAnalyzing(false);
          }).catch(err => {
              if (requestRef.current !== requestId) return;
              console.error(err);
              setAnalyzing(false);
          });
      } else if (stocks.length === 1) {
          const symbol = stocks[0].symbol;
          fetchFinancialAnalysis(symbol, currentFiles).then((result) => {
            if (requestRef.current !== requestId) return;
            setHealthData(result.health);
            setValuationData(result.valuation);
            setAnalyzing(false);
          }).catch(err => {
            if (requestRef.current !== requestId) return;
            console.error(err);
            setAnalyzing(false);
          });
      }
    } catch (error) {
      if (requestRef.current === requestId) {
        console.error("Error loading data", error);
      }
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false);
      }
    }
  };

  const handleFilesSelected = (files: UploadedFile[]) => {
    setCurrentFiles(files);
    if (stockData.length === 1 && !loading) {
        setAnalyzing(true);
        fetchFinancialAnalysis(stockData[0].symbol, files).then((result) => {
            setHealthData(result.health);
            setValuationData(result.valuation);
            setAnalyzing(false);
        }).catch(err => {
            console.error(err);
            setAnalyzing(false);
        });
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || stockData.length === 0) return;
    
    const currentQ = question;
    setQuestion('');
    setLastQuestion(currentQ);
    setAsking(true);
    
    try {
      const context = stockData.length > 1 ? comparisonData : { healthData, valuationData };
      const symbolContext = stockData.map(s => s.symbol).join(', ');
      const result = await askAiBanker(symbolContext, currentQ, context);
      setAnswer(result);
    } catch (error) {
      console.error("Failed to get answer", error);
    } finally {
      setAsking(false);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (format: 'csv' | 'doc' | 'pdf' | 'pptx') => {
    if (!answer) return;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${primaryStock?.symbol || 'Analysis'}_${timestamp}`;
    
    try {
        if (format === 'csv') {
            const safeText = answer.replace(/"/g, '""');
            const content = `"Question","Answer"\n"${lastQuestion.replace(/"/g, '""')}","${safeText}"`;
            const blob = new Blob([content], { type: 'text/csv' });
            triggerDownload(blob, `${filename}.csv`);
        } else if (format === 'doc') {
            const content = `<html><body><h1>AI Analysis: ${primaryStock?.symbol}</h1><div style="white-space: pre-wrap;">${answer}</div></body></html>`;
            const blob = new Blob([content], { type: 'application/msword' });
            triggerDownload(blob, `${filename}.doc`);
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const maxLineWidth = pageWidth - (margin * 2);
            let y = margin;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text(`AI Banker Report: ${primaryStock?.symbol || 'Analysis'}`, margin, y);
            y += 15;
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const splitAnswer = doc.splitTextToSize(answer, maxLineWidth);
            for (let i = 0; i < splitAnswer.length; i++) {
                if (y + 7 > pageHeight - margin) { doc.addPage(); y = margin; }
                doc.text(splitAnswer[i], margin, y);
                y += 7;
            }
            doc.save(`${filename}.pdf`);
        } else if (format === 'pptx') {
            const pptx = new PptxGenJS();
            const CHARS_PER_SLIDE = 800;
            let remainingText = answer;
            let slideIndex = 1;
            while (remainingText.length > 0) {
                let chunk = remainingText.length <= CHARS_PER_SLIDE ? remainingText : remainingText.substring(0, remainingText.lastIndexOf(" ", CHARS_PER_SLIDE));
                remainingText = remainingText.substring(chunk.length).trim();
                addContentSlide(pptx, chunk, primaryStock?.symbol, lastQuestion, slideIndex++);
            }
            await pptx.writeFile({ fileName: `${filename}.pptx` });
        }
    } catch (error) {
        console.error("Export Error:", error);
    }
  };

  const addContentSlide = (pptx: any, text: string, symbol: string | undefined, question: string, index: number) => {
      const slide = pptx.addSlide();
      slide.background = { color: '0F172A' };
      slide.addText(`Q: ${question.substring(0, 90)}`, { x: 0.5, y: 0.5, w: '90%', fontSize: 16, bold: true, color: 'FFFFFF' });
      slide.addText(text, { x: 0.5, y: 1.4, w: '90%', h: '70%', fontSize: 12, color: 'CBD5E1', valign: 'top', lineSpacing: 18 });
  };

  useEffect(() => { loadData('AAPL'); }, []);
  useEffect(() => { if (answer && messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [answer]);

  const isComparison = stockData.length > 1;
  const primaryStock = stockData[0];

  const getSamplePrompts = () => isComparison 
    ? ["Compare profit margins", "P/E Ratio trends", "Strongest balance sheet", "LBO analysis suitability"]
    : [`Is ${primaryStock?.symbol} undervalued?`, `Key risks for ${primaryStock?.symbol}`, `Growth drivers analysis`, `Bullish thesis` ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar 
        onSearch={loadData} 
        isLoading={loading} 
        selectedTimeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onFilesSelected={handleFilesSelected}
      />
      <AnalysisPanel onSelectPrompt={(text) => setQuestion(text)} ticker={primaryStock?.symbol} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-5 flex justify-between items-center shrink-0 h-20">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-3">
              {isComparison ? <span>Market Comparison</span> : primaryStock ? (<>{primaryStock.symbol} <span className="text-sm font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{primaryStock.currency}</span></>) : <div className="h-6 w-32 bg-slate-800 animate-pulse rounded"></div>}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{primaryStock?.lastUpdated ? `Last updated: ${primaryStock.lastUpdated}` : 'Market state: Offline'}</p>
          </div>
          {loading && <Loader2 className="animate-spin text-blue-500" />}
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {!isComparison && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard label="Price" value={primaryStock ? primaryStock.price.toFixed(2) : "---"} isCurrency />
                <MetricCard label="Daily Change" value={primaryStock ? primaryStock.change.toFixed(2) : "---"} subValue={primaryStock ? `${primaryStock.changePercent.toFixed(2)}%` : ""} trend={primaryStock ? (primaryStock.change >= 0 ? 'up' : 'down') : 'neutral'} />
                <MetricCard label="Market Cap" value={primaryStock ? primaryStock.marketCap : "---"} />
              </div>
            )}

            {isComparison && (
                 <div className="flex flex-wrap gap-2">
                     {stockData.map(s => (
                         <div key={s.symbol} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex items-center gap-3">
                             <span className="font-bold text-white">{s.symbol}</span>
                             <span className="text-slate-400 font-mono">${s.price.toFixed(2)}</span>
                             <span className={`text-xs ${s.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>{s.changePercent.toFixed(2)}%</span>
                         </div>
                     ))}
                 </div>
            )}

            {!isComparison && (
              <div className="border-b border-slate-800 nav-tabs">
                <nav className="-mb-px flex space-x-8">
                  {Object.values(AppTab).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 border-b-2 text-sm font-medium transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400 hover:text-slate-300'}`}>
                        {tab.replace('_', ' ')}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            <div className="min-h-[400px]">
              {isComparison ? (
                  <div className="space-y-6 animate-in fade-in">
                      <PriceChart stocks={stockData} timeRange={timeRange} />
                      
                      {analyzing && !comparisonData ? (
                           <div className="h-[200px] flex flex-col items-center justify-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
                               <Loader2 className="animate-spin text-blue-600 mb-2" />
                               <p>Calculating comparative metrics...</p>
                           </div>
                      ) : comparisonData ? (
                        <>
                           {/* Analyst Summary Card */}
                           <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
                               <div className="flex items-center gap-2 mb-4 text-slate-200">
                                   <Sparkles size={18} className="text-blue-500"/>
                                   <h3 className="font-semibold">Performance Comparison Insights</h3>
                               </div>
                               <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {(comparisonData.executiveSummary || []).map((point, idx) => (
                                       <li key={idx} className="flex items-start gap-3 text-sm text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800/50 hover:border-blue-500/20 transition-colors">
                                           <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                           <span className="leading-relaxed">{point}</span>
                                       </li>
                                   ))}
                               </ul>
                           </div>

                           <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                               <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/50">
                                   <Scale size={18} className="text-blue-500"/>
                                   <h3 className="font-semibold text-slate-200">Financial Comparison Matrix</h3>
                               </div>
                               <div className="overflow-x-auto">
                                   <table className="w-full text-sm text-left">
                                       <thead className="text-xs text-slate-500 uppercase bg-slate-950/30">
                                           <tr>
                                               <th className="px-6 py-3">Metric</th>
                                               {stockData.map(s => <th key={s.symbol} className="px-6 py-3 text-right">{s.symbol}</th>)}
                                           </tr>
                                       </thead>
                                       <tbody>
                                           {comparisonData.table.map((row, idx) => (
                                               <tr key={idx} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30">
                                                   <td className="px-6 py-4 text-slate-300">{row.metric}</td>
                                                   {stockData.map(s => <td key={s.symbol} className="px-6 py-4 text-right font-mono text-slate-400">{row[s.symbol] || '-'}</td>)}
                                               </tr>
                                           ))}
                                       </tbody>
                                   </table>
                               </div>
                               <div className="p-6 bg-slate-950/30 border-t border-slate-800">
                                   <div className="flex items-start gap-3 mb-2 text-white font-semibold">
                                       <Trophy className="text-yellow-500" /> Analyst Verdict: {comparisonData.winner}
                                   </div>
                                   <p className="text-slate-400 text-sm">{comparisonData.summary}</p>
                               </div>
                           </div>
                        </>
                      ) : null}
                  </div>
              ) : (
                  <>
                    {activeTab === AppTab.PRICE && primaryStock && <PriceChart stocks={[primaryStock]} timeRange={timeRange} />}
                    {activeTab === AppTab.FINANCIALS && (
                        <div className="space-y-6">
                            {analyzing ? <Loader2 className="animate-spin mx-auto text-blue-500" /> : healthData && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FinancialTable title="Balance Sheet" data={healthData.balanceSheet} />
                                    <FinancialTable title="Income Statement" data={healthData.incomeStatement} />
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === AppTab.VALUATION && valuationData && primaryStock && <ValuationCard data={valuationData} currentPrice={primaryStock.price} />}
                  </>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800">
               <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-4"><MessageSquare size={16} /> Interactive banker support</h3>
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                 {answer && (
                   <div className="mb-4 bg-blue-900/10 border border-blue-900/20 rounded-lg p-4 relative">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI analysis</span>
                        <div className="flex gap-2">
                           <button onClick={() => handleDownload('pdf')} className="text-slate-400 hover:text-white"><FileType size={14}/></button>
                           <button onClick={() => handleDownload('pptx')} className="text-slate-400 hover:text-white"><Presentation size={14}/></button>
                        </div>
                     </div>
                     <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{answer}</div>
                   </div>
                 )}
                 <form onSubmit={handleAsk} className="relative">
                   <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder={`Query the AI banker about ${isComparison ? 'the sector' : primaryStock?.symbol}...`} className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" disabled={asking} />
                   <button type="submit" disabled={asking || !question.trim()} className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded text-white disabled:opacity-50"><Send size={18} /></button>
                 </form>
                 <div className="mt-4 flex flex-wrap gap-2">
                    {getSamplePrompts().map((p, idx) => <button key={idx} onClick={() => setQuestion(p)} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-700 transition-colors">{p}</button>)}
                 </div>
               </div>
               <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;