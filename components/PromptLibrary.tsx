import React, { useState } from 'react';
import { BookOpen, Search, X, Terminal, Sparkles, FileText, PieChart, TrendingUp, Shield, Briefcase, Globe } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'A',
    title: 'Research Report Generation',
    icon: FileText,
    prompts: [
      "Generate a comprehensive pitch book for [COMPANY] including executive summary, investment thesis, market overview, competitive landscape, financial analysis, valuation summary, and transaction rationale",
      "Create a detailed CIM (Confidential Information Memorandum) for [COMPANY] with company overview, business description, market position, historical financials, management team bios, growth opportunities, and risk factors",
      "Produce an industry research report on [SECTOR] covering market size and trends, regulatory environment, competitive dynamics, key players analysis, M&A activity, and 5-year outlook",
      "Build a management presentation deck analyzing [COMPANY]'s strategic positioning, operational performance, financial metrics, peer benchmarking, and strategic alternatives",
      "Create an investor roadshow presentation with equity story, growth strategy, use of proceeds, and financial projections",
      "Generate a fairness opinion support book with valuation methodologies, market analysis, and transaction considerations"
    ]
  },
  {
    id: 'B',
    title: 'Financial Health & Due Diligence',
    icon: Shield,
    prompts: [
      "Perform comprehensive financial due diligence on [COMPANY] analyzing balance sheet quality, income statement trends, cash flow generation, working capital efficiency, and potential red flags",
      "Generate a Quality of Earnings (QoE) report identifying revenue quality, EBITDA adjustments, non-recurring items, accounting policies, normalized earnings, and sustainability of margins",
      "Create a credit analysis report with debt schedule, leverage ratios (Net Debt/EBITDA), interest coverage, covenant compliance, liquidity position, and refinancing risks",
      "Build a 13-week cash flow forecast with weekly cash receipts, disbursements, and ending cash balance including sensitivity scenarios",
      "Analyze working capital trends with DSO, DPO, inventory turns, cash conversion cycle, and working capital as % of revenue over past 3 years",
      "Generate a financial health scorecard evaluating liquidity ratios, leverage metrics, profitability margins, return on capital, and credit rating indicators",
      "Perform variance analysis on [COMPANY]'s financial performance comparing actual vs budget, year-over-year changes, and key driver analysis",
      "Create a margin decomposition analysis breaking down gross margin, EBITDA margin by segment, and identifying margin expansion/contraction drivers",
      "Generate a capex and R&D analysis evaluating historical spending, efficiency metrics, maintenance vs growth capex, and future requirements"
    ]
  },
  {
    id: 'C',
    title: 'Deal Structuring & Financial Modelling',
    icon: PieChart,
    prompts: [
      "Build a merger model for [ACQUIRER] acquiring [TARGET] including transaction assumptions, sources & uses of funds, pro forma balance sheet, accretion/dilution analysis, and transaction summary",
      "Create an LBO model for [COMPANY] with entry assumptions, capital structure, debt schedule, cash flow waterfall, exit scenarios, and IRR/MOIC returns analysis",
      "Generate a DCF valuation model for [COMPANY] with revenue and margin projections, NOPAT calculation, WACC derivation, terminal value, and sensitivity analysis on growth and discount rates",
      "Structure a leveraged recapitalization for [COMPANY] analyzing optimal debt capacity, debt instrument mix, use of proceeds, ownership impact, and returns to stakeholders",
      "Model a spin-off/carve-out transaction with stranded costs allocation, dis-synergies, standalone adjustments, capital structure optimization, and valuation of RemainCo and SpinCo",
      "Build a sum-of-the-parts (SOTP) valuation analyzing each business segment separately with appropriate valuation methodologies and conglomerate discount",
      "Create a dividend recapitalization model with new debt issuance, dividend to sponsors, revised capital structure, and credit metrics impact",
      "Generate a refinancing analysis comparing current debt structure vs proposed new structure with cash savings, tenor optimization, and covenant flexibility",
      "Model a SPAC merger transaction with pipe financing, earnouts, sponsor promote, redemptions, and pro forma ownership"
    ]
  },
  {
    id: 'D',
    title: 'Valuation & Comparison Analysis',
    icon: TrendingUp,
    prompts: [
      "Identify and analyze trading comps for [COMPANY] selecting appropriate peer companies and calculating valuation multiples: EV/Revenue, EV/EBITDA, EV/EBIT, P/E, P/B with current trading ranges",
      "Generate precedent transaction analysis for [SECTOR] identifying relevant M&A deals, calculating transaction multiples, analyzing premiums paid, and synergy assumptions",
      "Create a comprehensive football field valuation chart for [COMPANY] showing valuation ranges from DCF, trading comps, transaction comps, and LBO analysis",
      "Benchmark [COMPANY] financial performance against peer group analyzing revenue growth, margin profile, ROIC, leverage, and valuation multiples with visual dashboards",
      "Perform a precedent premiums analysis calculating control premiums paid in comparable transactions organized by deal type, strategic vs financial buyers",
      "Generate a discounted dividend model (DDM) for [COMPANY] projecting future dividends, applying cost of equity, and deriving equity value",
      "Create a comparable M&A transactions database for [SECTOR] with filters by deal size, date, buyer type, geography, and valuation metrics"
    ]
  },
  {
    id: 'E',
    title: 'Market Intelligence & Deal Sourcing',
    icon: Globe,
    prompts: [
      "Track M&A activity in [SECTOR] over the past 12 months including deal volume, aggregate value, average multiples, top acquirers, and emerging trends",
      "Monitor IPO pipeline and recent offerings analyzing deal size, pricing, valuation multiples, first-day returns, and aftermarket performance",
      "Analyze private equity activity in [SECTOR] covering fundraising, deployment pace, platform acquisitions, add-ons, exit activity, and holding periods",
      "Generate competitive intelligence on [STRATEGIC BUYER] including acquisition strategy, deal history, integration approach, typical multiples paid, and target criteria",
      "Identify potential acquisition targets in [SECTOR] matching criteria: revenue range, growth rate, margins, geography, and strategic fit",
      "Analyze debt capital markets activity tracking new issuances, spreads, covenant trends, and refinancing opportunities",
      "Monitor distressed opportunities and restructuring activity identifying stressed credits, bankruptcy filings, and DIP financing",
      "Track activist investor campaigns and proxy contests analyzing activist positions, demands, and outcomes"
    ]
  },
  {
    id: 'F',
    title: 'Document Analysis & Extraction',
    icon: BookOpen,
    prompts: [
      "Analyze the uploaded 10-K filing and extract: key financial metrics, revenue breakdown by segment, major risks disclosed, MD&A highlights, and management outlook",
      "Review the uploaded purchase agreement and summarize: purchase price and structure, representations and warranties, indemnification terms, closing conditions, and key covenants",
      "Extract key terms from the uploaded credit agreement including: facility types and sizes, pricing grid, financial covenants, reporting requirements, and material restrictions",
      "Analyze the uploaded CIM and generate executive summary with: business overview, financial highlights, growth drivers, competitive advantages, and investment considerations",
      "Review uploaded data room documents and create due diligence findings memo organized by: financial, legal, commercial, operational, and key risks",
      "Parse the uploaded NDA and identify: permitted use, confidentiality obligations, exclusions, term and termination, and standstill provisions",
      "Analyze uploaded management presentation and extract: strategic priorities, market opportunity, financial targets, key initiatives, and capital allocation strategy",
      "Review uploaded historical financial statements (3 years) and generate trend analysis with: revenue CAGR, margin progression, working capital trends, and cash generation"
    ]
  },
  {
    id: 'H',
    title: 'Specialized Analysis',
    icon: Briefcase,
    prompts: [
      "Perform a synergy analysis for [ACQUIRER] acquiring [TARGET] identifying: revenue synergies, cost synergies, implementation timeline, one-time costs, and risk-adjusted value",
      "Generate a carve-out financial model for [BUSINESS UNIT] building standalone financials with: revenue attribution, cost allocation, stranded costs, TSA costs, and normalized EBITDA",
      "Create a capital structure optimization analysis evaluating optimal debt/equity mix based on: target credit rating, tax shield benefits, financial flexibility, and cost of capital",
      "Build a bankruptcy valuation and recovery analysis estimating enterprise value, waterfall to creditors, and recovery rates by debt class",
      "Perform a sum-of-the-parts breakup analysis valuing each division separately and comparing to current market cap with implied holding company discount",
      "Generate a convertible bond analysis modeling conversion scenarios, call provisions, and impact on dilution",
      "Create a fairness opinion analysis addressing: valuation methodologies, range of values, board considerations, and transaction fairness from financial perspective",
      "Analyze customer/revenue concentration risk evaluating top customer exposures, contract terms, churn risk, and impact on valuation"
    ]
  },
  {
    id: 'I',
    title: 'Quick Analysis',
    icon: Sparkles,
    prompts: [
      "Is [COMPANY] undervalued right now?",
      "What are the key investment risks for [COMPANY]?",
      "Analyze the revenue growth drivers for [COMPANY]",
      "List the top 3 bullish and bearish arguments for [COMPANY]",
      "Compare [COMPANY] vs [PEER] financial performance",
      "What's [COMPANY]'s competitive moat?",
      "Estimate [COMPANY]'s debt capacity for an LBO",
      "Calculate implied acquisition premium at current price",
      "What's the fair value range for [COMPANY]?",
      "Identify potential strategic acquirers for [COMPANY]"
    ]
  }
];

interface PromptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
  ticker?: string;
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ isOpen, onClose, onSelectPrompt, ticker }) => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategory);

  const handlePromptClick = (text: string) => {
    // Replace [COMPANY] with ticker if available
    let processed = text;
    if (ticker) {
      processed = processed.replace(/\[COMPANY\]/g, ticker);
    }
    onSelectPrompt(processed);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
               <BookOpen className="text-white" size={20} />
             </div>
             <div>
               <h2 className="text-lg font-bold text-white">Banker Prompt Library</h2>
               <p className="text-xs text-slate-400">Select a professional prompt template to supercharge your analysis</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Categories */}
          <div className="w-64 bg-slate-950 border-r border-slate-800 overflow-y-auto hidden md:block">
            <div className="p-2 space-y-1">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all ${
                      selectedCategory === cat.id 
                        ? 'bg-blue-900/20 text-blue-400 border border-blue-900/30' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-left">{cat.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-slate-900 flex flex-col">
            
            {/* Search (Optional, good UX) */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search prompts..." 
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="mb-4">
                 <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                   {activeCategory?.icon && <activeCategory.icon size={20} className="text-blue-500" />}
                   {activeCategory?.title}
                 </h3>
                 <p className="text-sm text-slate-500">Select a prompt to auto-fill the chat input</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {activeCategory?.prompts
                  .filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    className="group text-left p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-200 relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 min-w-[20px] h-5 rounded-full border border-slate-700 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500/10 transition-colors">
                        <Terminal size={10} className="text-slate-500 group-hover:text-blue-400" />
                      </div>
                      <p className="text-sm text-slate-300 group-hover:text-white leading-relaxed">
                        {prompt.split(/(\[.*?\])/g).map((part, i) => (
                          part.match(/\[.*?\]/) ? 
                            <span key={i} className="text-blue-400 font-mono font-semibold">{part === '[COMPANY]' && ticker ? ticker : part}</span> 
                            : part
                        ))}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PromptLibrary;