"use client";

import React, { useRef } from "react";
import { Search, Loader2, Briefcase, DollarSign, Globe, TrendingUp } from "lucide-react";
import "../styles/animations.css";

interface HeroSectionProps {
  companyName: string;
  setCompanyName: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onSuggestionClick: (query: string) => void;
  sampleCompanies: Array<{ name: string; query: string }>;
}

export default function HeroSection({
  companyName,
  setCompanyName,
  onSubmit,
  isLoading,
  onSuggestionClick,
  sampleCompanies,
}: HeroSectionProps) {
  
  // Spotlight cursor coordinator
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className="space-y-12">
      {/* Search Console Hero Panel */}
      <section className="hero-glass-container rounded-3xl p-8 md:p-12 relative overflow-hidden">
        {/* Secondary backing visual glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-amber-50/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight leading-tight">
            <span className="text-shimmer">
              AI Stock Analysis & Automated Investment Research Platform
            </span>
          </h2>
          <p className="text-sm md:text-base text-zinc-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Enter any publicly traded corporation or stock symbol. Our financial agent scans real-time balance sheets, income statements, news catalysts, and SWOT models to generate institutional-grade equity valuation reports.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4.5 top-4.5 h-5 w-5 text-amber-500/50" />
              <input
                type="text"
                placeholder="Enter stock ticker or company name (e.g. NVDA, Reliance, Apple, TCS)..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
                className="w-full bg-zinc-950/70 border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-2xl py-4 pl-12 pr-4 text-base text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !companyName.trim()}
              className="btn-shine-sweep bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 border border-amber-500/20 text-black font-black rounded-2xl px-8 py-4 text-base transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-amber-500/15 cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-500 shrink-0 transform hover:scale-[1.03]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-black" />
                  <span className="text-black">Analyzing Ticker...</span>
                </>
              ) : (
                <>
                  <Briefcase className="w-5 h-5 text-black" />
                  <span className="text-black">Run Valuation Analysis</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-zinc-450 font-medium">Quick Suggestions:</span>
            {sampleCompanies.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => onSuggestionClick(c.query)}
                disabled={isLoading}
                className="text-xs bg-zinc-900/60 hover:bg-[#eab308]/10 hover:text-amber-400 border border-zinc-800 hover:border-amber-550/30 rounded-full px-3.5 py-1.5 text-zinc-300 transition-all duration-200 cursor-pointer font-medium"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Spotlight Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div
          onMouseMove={handleMouseMove}
          className="card-spotlight glass-premium rounded-2xl p-6 flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-center text-amber-400 mb-4 shadow-sm shadow-amber-500/5">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-amber-400 mb-2 tracking-tight">
              Automated Ticker Resolution & Balance Sheets
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Instantly resolve company names to correct global market tickers. Automatically scan SEC databases, income statements, revenue margins, debt-to-equity leverage ratios, and cash flows to assess company health.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div
          onMouseMove={handleMouseMove}
          className="card-spotlight glass-premium rounded-2xl p-6 flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-center text-amber-400 mb-4 shadow-sm shadow-amber-500/5">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-amber-400 mb-2 tracking-tight">
              Grounded Web Search & Market News Catalysts
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Retrieve the latest press releases, product launch events, and regulatory updates using autonomous Google search grounding. Leverage AI sentiment classification models to index potential catalysts for high-frequency stock scanning.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div
          onMouseMove={handleMouseMove}
          className="card-spotlight glass-premium rounded-2xl p-6 flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-center text-amber-400 mb-4 shadow-sm shadow-amber-500/5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-amber-400 mb-2 tracking-tight">
              Multi-Factor AI Valuation & Investment Thesis
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our machine learning pipeline builds a quantitative multi-factor valuation rating based on key ratios, profitability indicators, SWOT (Strengths, Weaknesses, Opportunities, Threats) cards, and deep investment theses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
