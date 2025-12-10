import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Terminal, Sparkles, FileText, PieChart, TrendingUp, Shield, Briefcase, Globe, BookOpen } from 'lucide-react';

const CATEGORIES = [
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
  },
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
  }
];

interface AnalysisPanelProps {
  onSelectPrompt: (prompt: string) => void;
  ticker?: string;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onSelectPrompt, ticker }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('I');

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const handlePromptClick = (text: string) => {
    let processed = text;
    if (ticker) {
      processed = processed.replace(/\[COMPANY\]/g, ticker);
    }
    onSelectPrompt(processed);
  };

  const filteredCategories = searchTerm 
    ? CATEGORIES.filter(cat => 
        cat.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        cat.prompts.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : CATEGORIES;

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden shrink-0 hidden lg:flex">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900">
        <h2 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Terminal size={16} className="text-blue-500" />
          Analysis Toolkit
        </h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 text-slate-500" size={14} />
          <input 
            type="text" 
            placeholder="Search prompts..." 
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Prompt Categories */}
        <div className="p-2 space-y-1 mt-2">
          {filteredCategories.map(cat => {
            const isExpanded = expandedCategory === cat.id || searchTerm.length > 0;
            const Icon = cat.icon;
            
            return (
              <div key={cat.id} className="rounded-lg overflow-hidden transition-all duration-200">
                <button 
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors ${
                    isExpanded 
                      ? 'bg-slate-800 text-blue-400' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} />
                    <span>{cat.title}</span>
                  </div>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isExpanded && (
                  <div className="bg-slate-950/50 border-l-2 border-slate-800 ml-4 my-1">
                    {cat.prompts
                      .filter(p => !searchTerm || p.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePromptClick(prompt)}
                        className="w-full text-left px-3 py-2 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 last:border-0 leading-relaxed"
                      >
                         {prompt.split(/(\[.*?\])/g).map((part, i) => (
                          part.match(/\[.*?\]/) ? 
                            <span key={i} className="text-blue-500 font-mono font-medium">{part === '[COMPANY]' && ticker ? ticker : part}</span> 
                            : part
                        ))}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer hint */}
      <div className="p-3 border-t border-slate-800 bg-slate-900 text-[10px] text-slate-500 text-center">
        Select a prompt to analyze
      </div>
    </div>
  );
};

export default AnalysisPanel;