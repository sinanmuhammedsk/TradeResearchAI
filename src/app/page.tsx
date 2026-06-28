'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  Briefcase, 
  Globe, 
  MapPin, 
  User, 
  FileText, 
  DollarSign, 
  Percent, 
  TrendingDown, 
  CheckCircle, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import CreatorButton from '../components/CreatorButton';
import CreatorModal from '../components/CreatorModal';
import HeroSection from '../components/HeroSection';

interface HistoricalStatement {
  date: string;
  revenue: number | null;
  netIncome: number | null;
}

interface CompanyData {
  profile: {
    name: string;
    ticker: string;
    industry: string;
    sector: string;
    ceo: string;
    headquarters: string;
    description: string;
    website: string;
    employees: number | null;
  };
  financials: {
    revenue: number | null;
    netIncome: number | null;
    eps: number | null;
    marketCap: number | null;
    profitMargin: number | null;
    freeCashFlow: number | null;
    debt: number | null;
    roe: number | null;
    revenueGrowth: number | null;
  };
  stockInfo: {
    currentPrice: number | null;
    fiftyTwoWeekHigh: number | null;
    fiftyTwoWeekLow: number | null;
    peRatio: number | null;
    volume: number | null;
    currency: string;
  };
  news: Array<{
    title: string;
    publisher: string;
    link: string;
    publishedAt: string;
  }>;
  history: HistoricalStatement[];
}

interface AIAnalysis {
  strengths: string[];
  risks: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  recommendation: 'INVEST' | 'HOLD' | 'PASS';
  confidenceScore: number;
  reasoning: string;
}

interface AnalysisResult {
  company: CompanyData;
  analysis: AIAnalysis;
}

export default function Dashboard() {
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const sampleCompanies = [
    { name: 'Apple', query: 'Apple' },
    { name: 'Tesla', query: 'Tesla' },
    { name: 'NVIDIA', query: 'NVIDIA' },
    { name: 'Microsoft', query: 'Microsoft' },
    { name: 'Amazon', query: 'Amazon' },
    { name: 'Reliance', query: 'Reliance.NS' },
    { name: 'TCS', query: 'TCS.NS' }
  ];

  // Progress message based on current active step
  const getProgressMessage = () => {
    switch (progressStep) {
      case 1:
        return 'Finding company ticker symbol...';
      case 2:
        return 'Fetching core financial statements & ratios...';
      case 3:
        return 'Collecting recent news articles & corporate info...';
      case 4:
        return 'Running LangChain agent & Gemini investment reasoning...';
      default:
        return 'Initializing research agent...';
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgressStep(1);

    // Simulate stepping through progress points to give nice responsive feedback
    const timer1 = setTimeout(() => setProgressStep(2), 2500);
    const timer2 = setTimeout(() => setProgressStep(3), 5500);
    const timer3 = setTimeout(() => setProgressStep(4), 8500);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: query }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unexpected error occurred. Please try again.');
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to the analysis service.');
    } finally {
      setIsLoading(false);
      setProgressStep(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(companyName);
  };

  // Helper to format large financial numbers
  const formatFinancial = (val: number | null, currency = 'USD') => {
    if (val === null || val === undefined) return 'N/A';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
      notation: 'compact',
      compactDisplay: 'short'
    });
    
    return formatter.format(val);
  };

  const formatPercent = (val: number | null) => {
    if (val === null || val === undefined) return 'N/A';
    return `${(val * 100).toFixed(2)}%`;
  };

  // A custom, lightweight renderer that parses Markdown blocks to styled React tags safely
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    let inList = false;
    let listItems: React.ReactNode[] = [];
    const elements: React.ReactNode[] = [];
    let keyIdx = 0;

    const formatBold = (txt: string) => {
      const parts = txt.split(/\*\*([^*]+)\*\*/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return <strong key={index} className="text-white font-semibold">{part}</strong>;
        }
        return part;
      });
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check headers (ordered longest to shortest prefix to avoid greediness)
      if (line.startsWith('### ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${keyIdx++}`} className="list-disc pl-5 my-4 text-slate-300 space-y-2">
              {...listItems}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        elements.push(
          <h3 key={`h3-${keyIdx++}`} className="text-base font-bold text-indigo-400 mt-5 mb-2">
            {formatBold(line.slice(4))}
          </h3>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${keyIdx++}`} className="list-disc pl-5 my-4 text-slate-300 space-y-2">
              {...listItems}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        elements.push(
          <h2 key={`h2-${keyIdx++}`} className="text-lg font-extrabold text-slate-100 border-b border-slate-900 pb-1.5 mt-7 mb-3.5">
            {formatBold(line.slice(3))}
          </h2>
        );
        continue;
      }
      if (line.startsWith('# ')) {
        if (inList) {
          elements.push(
            <ul key={`list-${keyIdx++}`} className="list-disc pl-5 my-4 text-slate-300 space-y-2">
              {...listItems}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        elements.push(
          <h1 key={`h1-${keyIdx++}`} className="text-xl font-black text-white mt-9 mb-4.5">
            {formatBold(line.slice(2))}
          </h1>
        );
        continue;
      }

      // Check list items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        inList = true;
        listItems.push(
          <li key={`li-${i}`} className="text-slate-300 text-sm leading-relaxed">
            {formatBold(line.slice(2))}
          </li>
        );
        continue;
      }

      // Check if list ended
      if (inList && !line.startsWith('- ') && !line.startsWith('* ')) {
        elements.push(
          <ul key={`list-${keyIdx++}`} className="list-disc pl-5 my-4 text-slate-300 space-y-2">
            {...listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }

      // Check blockquote
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={`bq-${keyIdx++}`} className="border-l-4 border-indigo-500 pl-4 py-2 my-4 text-slate-400 italic bg-indigo-950/20 rounded-r">
            {formatBold(line.slice(2))}
          </blockquote>
        );
        continue;
      }

      if (line === '') {
        continue;
      }

      // Default paragraph
      elements.push(
        <p key={`p-${keyIdx++}`} className="my-3 text-slate-300 text-sm leading-relaxed">
          {formatBold(line)}
        </p>
      );
    }

    if (inList) {
      elements.push(
        <ul key={`list-${keyIdx++}`} className="list-disc pl-5 my-4 text-slate-300 space-y-2">
          {...listItems}
        </ul>
      );
    }

    return <div className="prose-ai">{elements}</div>;
  };

  // Pure SVG Dual Axis Chart for Revenue (Bars) and Net Income (Line)
  const FinancialChart = ({ history, currency }: { history: HistoricalStatement[], currency: string }) => {
    if (!history || history.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 rounded bg-slate-950/30 border border-slate-800 border-dashed text-slate-500 text-sm">
          <Info className="w-5 h-5 mb-2 text-slate-600" />
          No historical statement data available.
        </div>
      );
    }

    const width = 500;
    const height = 240;
    const paddingLeft = 55;
    const paddingRight = 55;
    const paddingTop = 25;
    const paddingBottom = 35;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Calculate bounds
    const revenues = history.map(h => h.revenue || 0);
    const netIncomes = history.map(h => h.netIncome || 0);

    const maxRev = Math.max(...revenues, 1) * 1.15; // 15% padding
    const minRev = Math.min(...revenues, 0);

    const maxNet = Math.max(...netIncomes, 1) * 1.15;
    const minNet = Math.min(...netIncomes, 0);

    // Helpers to scale values
    const getX = (index: number) => {
      if (history.length <= 1) return paddingLeft + chartWidth / 2;
      return paddingLeft + (index / (history.length - 1)) * chartWidth;
    };

    const getYRev = (val: number) => {
      const scale = chartHeight / (maxRev - minRev);
      return paddingTop + chartHeight - (val - minRev) * scale;
    };

    const getYNet = (val: number) => {
      const scale = chartHeight / (maxNet - minNet);
      return paddingTop + chartHeight - (val - minNet) * scale;
    };

    // Build the line path for net income
    const netIncomePoints = history.map((h, i) => ({
      x: getX(i),
      y: getYNet(h.netIncome || 0)
    }));

    const linePathD = netIncomePoints.length > 1
      ? `M ${netIncomePoints[0].x} ${netIncomePoints[0].y} ` + 
        netIncomePoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : '';

    // Format display ticks
    const formatTick = (val: number) => {
      if (val >= 1e12) return `${(val / 1e12).toFixed(1)}T`;
      if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
      if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
      return val.toLocaleString();
    };

    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-2">
            <span className="font-semibold text-slate-700">Historical Statement Trends ({history.length} Years)</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-indigo-500 rounded-sm"></span>
                <span>Revenue (Left Axis)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-0.5 bg-emerald-500 inline-block relative bottom-0.5"></span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                <span>Net Income (Right Axis)</span>
              </div>
            </div>
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingTop + ratio * chartHeight;
              return (
                <line 
                  key={i} 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={paddingLeft + chartWidth} 
                  y2={y} 
                  stroke="#e2e8f0" 
                  strokeWidth="1" 
                  strokeDasharray="4 4" 
                />
              );
            })}

            {/* Left Axis: Revenue Labels */}
            {[0, 0.5, 1].map((ratio, i) => {
              const val = maxRev - ratio * (maxRev - minRev);
              const y = getYRev(val);
              return (
                <text key={i} x={paddingLeft - 8} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">
                  {formatTick(val)}
                </text>
              );
            })}

            {/* Right Axis: Net Income Labels */}
            {[0, 0.5, 1].map((ratio, i) => {
              const val = maxNet - ratio * (maxNet - minNet);
              const y = getYNet(val);
              return (
                <text key={i} x={paddingLeft + chartWidth + 8} y={y + 4} textAnchor="start" fill="#10b981" fontSize="10">
                  {formatTick(val)}
                </text>
              );
            })}

            {/* Bars: Revenue (Drawn first so line is on top) */}
            {history.map((h, i) => {
              const x = getX(i);
              const barWidth = Math.min(30, chartWidth / (history.length * 2));
              const revY = getYRev(h.revenue || 0);
              const zeroY = getYRev(0);
              const barY = Math.min(revY, zeroY);
              const barHeight = Math.max(Math.abs(zeroY - revY), 2);

              return (
                <g key={i} className="group">
                  <rect
                    x={x - barWidth / 2}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill="url(#revGrad)"
                    rx="3"
                    className="transition-all duration-200 group-hover:fill-indigo-500"
                  />
                  {/* Tooltip text for Revenue */}
                  <text 
                    x={x} 
                    y={barY - 6} 
                    textAnchor="middle" 
                    fill="#4f46e5" 
                    fontSize="9" 
                    fontWeight="600"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    {formatTick(h.revenue || 0)}
                  </text>
                </g>
              );
            })}

            {/* Line: Net Income */}
            {linePathD && (
              <path
                d={linePathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Nodes: Net Income points */}
            {history.map((h, i) => {
              const x = getX(i);
              const y = getYNet(h.netIncome || 0);

              return (
                <g key={i} className="group">
                  <circle
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-200 group-hover:r-6 cursor-pointer"
                  />
                  {/* Tooltip text for Net Income */}
                  <text 
                    x={x} 
                    y={y - 8} 
                    textAnchor="middle" 
                    fill="#059669" 
                    fontSize="9" 
                    fontWeight="600"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    {formatTick(h.netIncome || 0)}
                  </text>
                </g>
              );
            })}

            {/* X-Axis labels: Years */}
            {history.map((h, i) => {
              const x = getX(i);
              const year = h.date ? h.date.split('-')[0] : '';
              return (
                <text key={i} x={x} y={height - 10} textAnchor="middle" fill="#64748b" fontSize="10">
                  {year}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-full">
      {/* Top Header Bar */}
      <header className="border-b border-amber-500/20 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500/10 border border-amber-500/25 p-2 rounded-xl text-amber-400 shadow-sm shadow-amber-500/5 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor">
                {/* Advanced Professional Hex Shield Logo */}
                <polygon points="16,2 29,9 29,23 16,30 3,23 3,9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                
                {/* Ascending Trend Line */}
                <path d="M 8,22 L 24,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M 19,10 H 24 V 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Candlestick bars reflecting Trade & Analysis */}
                {/* Left Candle */}
                <line x1="11" y1="15" x2="11" y2="23" stroke="currentColor" strokeWidth="1" />
                <rect x="9.5" y="17" width="3" height="4" fill="currentColor" stroke="none" />
                
                {/* Middle Candle */}
                <line x1="16" y1="11" x2="16" y2="19" stroke="currentColor" strokeWidth="1" />
                <rect x="14.5" y="13" width="3" height="4" fill="currentColor" stroke="none" />
                
                {/* Right Candle */}
                <line x1="21" y1="7" x2="21" y2="15" stroke="currentColor" strokeWidth="1" />
                <rect x="19.5" y="9" width="3" height="4" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-amber-400 tracking-tight">
                TradeResearch AI
              </h1>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Grounded AI Stock Scanner</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <CreatorButton onClick={() => setIsCreatorOpen(true)} />
            <div className="flex items-center text-xs text-amber-400 font-semibold bg-zinc-900/60 border border-zinc-800 rounded-full px-3 py-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2 animate-ping"></span>
              <span>Agent Status: Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Search Panel Card - Conditionally hidden when results are displayed to keep page extremely clean */}
        {!result && !isLoading && (
          <HeroSection
            companyName={companyName}
            setCompanyName={setCompanyName}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onSuggestionClick={(query) => {
              setCompanyName(query);
              handleSearch(query);
            }}
            sampleCompanies={sampleCompanies}
          />
        )}

        {/* Loading State Glass Card */}
        {isLoading && (
          <section className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6 bg-zinc-900/60 border border-amber-500/15 shadow-xl">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-amber-500 animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-950 p-2 rounded-full border border-zinc-800">
                <Briefcase className="w-6 h-6 text-amber-450" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-amber-400">{getProgressMessage()}</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Running data fetchers and generating deep financial insights. This may take up to 15 seconds.
              </p>
            </div>

            {/* Checklist items showing subtask progress */}
            <div className="w-full max-w-md bg-zinc-950/80 rounded-xl border border-zinc-800/80 p-4 text-left divide-y divide-zinc-900">
              <div className="flex items-center justify-between py-2 text-xs">
                <span className="text-zinc-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${progressStep >= 1 ? 'bg-amber-500' : 'bg-zinc-700'}`}></span>
                  1. Ticker Symbol Resolution
                </span>
                <span className="font-semibold text-zinc-500">
                  {progressStep > 1 ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Done</span>
                  ) : progressStep === 1 ? (
                    <span className="text-amber-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Active</span>
                  ) : (
                    'Pending'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 text-xs">
                <span className="text-zinc-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${progressStep >= 2 ? 'bg-amber-500' : 'bg-zinc-700'}`}></span>
                  2. Dynamic Balance Sheet & Income Fetch
                </span>
                <span className="font-semibold text-zinc-500">
                  {progressStep > 2 ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Done</span>
                  ) : progressStep === 2 ? (
                    <span className="text-amber-400 flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Active</span>
                  ) : (
                    'Pending'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 text-xs">
                <span className="text-zinc-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${progressStep >= 3 ? 'bg-amber-500' : 'bg-zinc-700'}`}></span>
                  3. Recent Financial News Extraction
                </span>
                <span className="font-semibold text-zinc-500">
                  {progressStep > 3 ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Done</span>
                  ) : progressStep === 3 ? (
                    <span className="text-amber-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Active</span>
                  ) : (
                    'Pending'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 text-xs">
                <span className="text-zinc-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${progressStep >= 4 ? 'bg-amber-500' : 'bg-zinc-700'}`}></span>
                  4. Gemini AI Multi-Factor Analysis
                </span>
                <span className="font-semibold text-zinc-500">
                  {progressStep === 4 ? (
                    <span className="text-amber-400 flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing</span>
                  ) : (
                    'Pending'
                  )}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Error State Panel */}
        {error && (
          <section className="glass-card rounded-2xl border-red-200 bg-red-50/50 p-6 flex items-start gap-4">
            <div className="bg-red-100 border border-red-200 p-2 rounded-xl text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Analysis Pipeline Interrupted</h3>
              <p className="text-sm text-slate-600 mt-1">{error}</p>
            </div>
          </section>
        )}

        {/* Report Results View */}
        {result && (
          <div className="space-y-6">
            
            {/* Header Action Bar with clear back button to allow analyzing another company */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-zinc-900/60 border border-amber-500/15 rounded-2xl p-4 shadow-lg shadow-black">
              <button 
                onClick={() => {
                  setResult(null);
                  setCompanyName('');
                  setError(null);
                }}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 cursor-pointer bg-zinc-950 border border-amber-500/20 rounded-xl px-4 py-2.5 hover:bg-amber-500/10 transition-all duration-200"
              >
                ← Analyze Another Company
              </button>
              <div className="text-xs text-zinc-400 font-medium text-center sm:text-right">
                AI Stock Analysis Report generated via Gemini Search Grounding • {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* 1. Header Profile & Recommendations Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Profile Card */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between bg-zinc-900/40 border-amber-500/10 shadow-lg">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center rounded-xl text-amber-400 font-extrabold text-lg">
                      {result.company.profile.ticker.slice(0, 3)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                        {result.company.profile.name}
                        <span className="text-xs bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-amber-400 font-mono">
                          {result.company.profile.ticker}
                        </span>
                      </h2>
                      <p className="text-xs text-zinc-400 font-medium">
                        {result.company.profile.sector} • {result.company.profile.industry}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-zinc-300 line-clamp-4 leading-relaxed mb-4">
                    {result.company.profile.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800 pt-4 mt-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <User className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-zinc-450 font-medium">CEO</div>
                      <div className="text-zinc-200 font-semibold">{result.company.profile.ceo}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-zinc-450 font-medium">Headquarters</div>
                      <div className="text-zinc-200 font-semibold truncate max-w-[150px]" title={result.company.profile.headquarters}>
                        {result.company.profile.headquarters.split(',')[0]}
                      </div>
                    </div>
                  </div>
                  {result.company.profile.website && (
                    <div className="flex items-center space-x-2 text-xs">
                      <Globe className="w-4 h-4 text-amber-500" />
                      <div>
                        <div className="text-zinc-450 font-medium">Website</div>
                        <a 
                          href={result.company.profile.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-amber-400 font-semibold hover:underline flex items-center gap-0.5 hover:text-amber-300"
                        >
                          Visit Site <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="glass-card rounded-2xl p-6 flex flex-col justify-between items-center text-center relative overflow-hidden bg-zinc-900/40 border-amber-500/10 shadow-lg">
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-450 mb-4">AI Valuation Rating</h3>
                  
                  {/* Visual Recommendation Badge */}
                  {result.analysis.recommendation === 'INVEST' ? (
                    <div className="bg-emerald-955/20 border border-emerald-500/30 text-emerald-400 text-3xl font-extrabold px-8 py-3 rounded-2xl shadow-sm tracking-wider">
                      INVEST
                    </div>
                  ) : result.analysis.recommendation === 'HOLD' ? (
                    <div className="bg-amber-955/20 border border-amber-500/30 text-amber-400 text-3xl font-extrabold px-8 py-3 rounded-2xl shadow-sm tracking-wider">
                      HOLD
                    </div>
                  ) : (
                    <div className="bg-rose-955/20 border border-rose-500/30 text-rose-450 text-3xl font-extrabold px-8 py-3 rounded-2xl shadow-sm tracking-wider">
                      PASS
                    </div>
                  )}
                </div>

                {/* Circular Confidence Score Meter */}
                <div className="relative my-6 flex items-center justify-center">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="46" fill="transparent" stroke="#27272a" strokeWidth="6" />
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      fill="transparent"
                      stroke={
                        result.analysis.recommendation === 'INVEST'
                          ? '#10b981'
                          : result.analysis.recommendation === 'HOLD'
                          ? '#d97706'
                          : '#ef4444'
                      }
                      strokeWidth="6.5"
                      strokeDasharray="289"
                      strokeDashoffset={289 - (289 * result.analysis.confidenceScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-zinc-100">{result.analysis.confidenceScore}%</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Confidence</span>
                  </div>
                </div>

                <div className="w-full text-xs text-zinc-400 flex items-center justify-center gap-1.5 bg-zinc-950/60 border border-zinc-800 rounded-xl py-2 px-3">
                  <ShieldCheck className={`w-4 h-4 ${result.analysis.recommendation === 'INVEST' ? 'text-emerald-450' : 'text-zinc-500'}`} />
                  <span>AI Agent verified report complete</span>
                </div>
              </div>

            </div>

            {/* 2. Financial Overview & SVG Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Financial Stats Column */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-6 bg-zinc-900/40 border-amber-500/10 shadow-lg">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    Financial Overview
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-955/40 border border-zinc-800/60 rounded-xl p-3">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Revenue</div>
                      <div className="text-base font-black text-zinc-100">
                        {formatFinancial(result.company.financials.revenue, result.company.stockInfo.currency)}
                      </div>
                    </div>

                    <div className="bg-zinc-955/40 border border-zinc-800/60 rounded-xl p-3">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Net Income</div>
                      <div className="text-base font-black text-zinc-100">
                        {formatFinancial(result.company.financials.netIncome, result.company.stockInfo.currency)}
                      </div>
                    </div>

                    <div className="bg-zinc-955/40 border border-zinc-800/60 rounded-xl p-3">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">EPS (TTM)</div>
                      <div className="text-base font-black text-zinc-100">
                        {result.company.financials.eps !== null ? `${result.company.financials.eps.toFixed(2)}` : 'N/A'}
                      </div>
                    </div>

                    <div className="bg-zinc-955/40 border border-zinc-800/60 rounded-xl p-3">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Market Cap</div>
                      <div className="text-base font-black text-zinc-100">
                        {formatFinancial(result.company.financials.marketCap, result.company.stockInfo.currency)}
                      </div>
                    </div>

                    <div className="bg-zinc-955/40 border border-zinc-800/60 rounded-xl p-3">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Profit Margin</div>
                      <div className="text-base font-black text-zinc-100">
                        {formatPercent(result.company.financials.profitMargin)}
                      </div>
                    </div>

                    <div className="bg-zinc-955/40 border border-zinc-800/60 rounded-xl p-3">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Return on Equity</div>
                      <div className="text-base font-black text-zinc-100">
                        {formatPercent(result.company.financials.roe)}
                      </div>
                    </div>

                    <div className="bg-zinc-955/40 border border-zinc-800/60 rounded-xl p-3">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Free Cash Flow</div>
                      <div className="text-base font-black text-zinc-100">
                        {formatFinancial(result.company.financials.freeCashFlow, result.company.stockInfo.currency)}
                      </div>
                    </div>

                    <div className="bg-zinc-955/40 border border-zinc-800/60 rounded-xl p-3">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Debt</div>
                      <div className="text-base font-black text-zinc-300">
                        {formatFinancial(result.company.financials.debt, result.company.stockInfo.currency)}
                      </div>
                    </div>

                    <div className="bg-zinc-955/40 border border-zinc-800/60 rounded-xl p-3">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Revenue Growth</div>
                      <div className="text-base font-black flex items-center gap-1 text-zinc-100">
                        {result.company.financials.revenueGrowth !== null ? (
                          <>
                            {result.company.financials.revenueGrowth >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-rose-600" />
                            )}
                            <span className={result.company.financials.revenueGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {formatPercent(result.company.financials.revenueGrowth)}
                            </span>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* History SVG Chart */}
                <div className="pt-2 border-t border-zinc-800">
                  <FinancialChart 
                    history={result.company.history} 
                    currency={result.company.stockInfo.currency} 
                  />
                </div>
              </div>

              {/* Stock Quote Card */}
              <div className="glass-card rounded-2xl p-6 flex flex-col justify-between bg-zinc-900/40 border-amber-500/10 shadow-lg">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    Market Stock Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs text-zinc-450">Current Stock Price</span>
                      <span className="text-sm font-bold text-zinc-100">
                        {result.company.stockInfo.currentPrice?.toFixed(2)} {result.company.stockInfo.currency}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs text-zinc-455">Trailing P/E Ratio</span>
                      <span className="text-sm font-bold text-zinc-100">
                        {result.company.stockInfo.peRatio !== null ? result.company.stockInfo.peRatio.toFixed(2) : 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs text-zinc-455">Trading Volume</span>
                      <span className="text-sm font-bold text-zinc-100">
                        {result.company.stockInfo.volume?.toLocaleString()}
                      </span>
                    </div>

                    {/* 52-Week Range Bar Dial */}
                    {result.company.stockInfo.fiftyTwoWeekLow !== null && result.company.stockInfo.fiftyTwoWeekHigh !== null && (
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                          <span>52-Week Low</span>
                          <span>52-Week High</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-2">
                          <span>{result.company.stockInfo.fiftyTwoWeekLow.toFixed(2)}</span>
                          <span>{result.company.stockInfo.fiftyTwoWeekHigh.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-zinc-950 rounded-full w-full relative border border-zinc-800">
                          {/* Calculate relative position */}
                          {(() => {
                            const low = result.company.stockInfo.fiftyTwoWeekLow!;
                            const high = result.company.stockInfo.fiftyTwoWeekHigh!;
                            const curr = result.company.stockInfo.currentPrice || low;
                            const pos = Math.max(0, Math.min(100, ((curr - low) / (high - low)) * 100));
                            return (
                              <div 
                                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-amber-500 border border-white rounded-full shadow-sm" 
                                style={{ left: `calc(${pos}% - 6px)` }}
                                title={`Current is ${pos.toFixed(1)}% of 52W range`}
                              ></div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-400">
                  Market prices are pulled live from Yahoo Finance. Financial definitions may vary. Standard trading volumes are displayed.
                </div>
              </div>

            </div>

            {/* 3. Strengths vs Risks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Strengths Card */}
              <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                  Key Strengths
                </h3>
                <ul className="space-y-3.5">
                  {result.analysis.strengths.map((str, idx) => (
                    <li key={idx} className="text-sm text-zinc-300 flex items-start gap-3">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-bold text-xs shrink-0 mt-0.5 animate-pulse">
                        {idx + 1}
                      </span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks Card */}
              <div className="glass-card rounded-2xl p-6 border border-rose-500/20 bg-rose-950/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                  Key Risks
                </h3>
                <ul className="space-y-3.5">
                  {result.analysis.risks.map((risk, idx) => (
                    <li key={idx} className="text-sm text-zinc-300 flex items-start gap-3">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/30 font-bold text-xs shrink-0 mt-0.5 animate-pulse">
                        {idx + 1}
                      </span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* 4. SWOT Analysis Grid */}
            <section className="glass-card rounded-2xl p-6 bg-zinc-900/40 border-amber-500/10 shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-amber-500" />
                SWOT Stock Analysis (Strengths, Weaknesses, Opportunities, Threats)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Strengths */}
                <div className="bg-emerald-950/15 border border-emerald-900/30 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">Strengths (S)</h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-zinc-300">
                    {result.analysis.swot.strengths.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-rose-955/15 border border-rose-900/30 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-455 mb-3">Weaknesses (W)</h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-zinc-300">
                    {result.analysis.swot.weaknesses.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-amber-955/15 border border-amber-900/30 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">Opportunities (O)</h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-zinc-300">
                    {result.analysis.swot.opportunities.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>

                {/* Threats */}
                <div className="bg-orange-955/15 border border-orange-900/30 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">Threats (T)</h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-zinc-300">
                    {result.analysis.swot.threats.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>

              </div>
            </section>

            {/* 5. Detailed AI Reasoning */}
            <section className="glass-card rounded-2xl p-6 bg-zinc-900/40 border-amber-500/10 shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-amber-500" />
                AI Stock Valuation Model & Automated Investment Thesis
              </h3>
              
              <div className="bg-zinc-950/40 rounded-xl border border-zinc-800 p-5 md:p-6 overflow-y-auto max-h-[500px]">
                {renderMarkdown(result.analysis.reasoning)}
              </div>
            </section>

            {/* 6. Recent News Articles Card */}
            <section className="glass-card rounded-2xl p-6 bg-zinc-900/40 border-amber-500/10 shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                <Globe className="w-4.5 h-4.5 text-amber-500" />
                Real-Time Market News Catalysts & Equity Sentiment Analytics
              </h3>

              {result.company.news.length === 0 ? (
                <div className="text-center text-xs text-zinc-500 py-8 bg-zinc-950/30 border border-zinc-800 rounded-xl border-dashed">
                  No recent articles or product launches found in current cache.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.company.news.map((item, idx) => {
                    const cleanDate = new Date(item.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });

                    return (
                      <a
                        key={idx}
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-zinc-950/30 border border-zinc-850 hover:border-amber-500/30 hover:bg-amber-955/5 rounded-xl p-4 flex flex-col justify-between group transition-all duration-200 shadow-md cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold mb-2">
                            <span>{item.publisher}</span>
                            <span>{cleanDate}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors duration-200 line-clamp-2">
                            {item.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-amber-450 font-bold mt-4 self-end">
                          <span>Read Source</span>
                          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </section>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 text-center py-6 text-xs text-zinc-500">
        <p className="max-w-2xl mx-auto px-4">
          Disclaimer: This investment research dashboard is for informational and educational purposes only. It is not financial or professional investing advice. Stock research is performed autonomously by AI systems which can hallucinate or process lagging numbers. Perform your own due diligence.
        </p>
        <p className="mt-2 text-[10px]">
          © {new Date().getFullYear()} AI Investment Research Agent. Built with Next.js, LangChain.js and Google Gemini.
        </p>
      </footer>
      <CreatorModal isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)} />
    </div>
  );
}
