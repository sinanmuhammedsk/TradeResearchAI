import YahooFinance from 'yahoo-finance2';

// Initialize the yahooFinance instance with notice suppression
const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey']
});

export interface HistoricalStatement {
  date: string;
  revenue: number | null;
  netIncome: number | null;
}

export interface CompanyData {
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

export class YahooFinanceService {
  /**
   * Resolves a company name to a stock ticker (e.g., "Apple" -> "AAPL")
   */
  static async resolveTicker(companyName: string): Promise<string> {
    const trimmed = companyName.trim();
    if (!trimmed) {
      throw new Error('Company name cannot be empty');
    }

    try {
      const searchResult = await yahooFinance.search(trimmed);
      const quotes = searchResult.quotes || [];

      if (quotes.length === 0) {
        throw new Error(`Could not find a ticker for "${companyName}"`);
      }

      // Check if there is an exact match for ticker name itself (e.g., user entered "AAPL")
      const exactTickerMatch = quotes.find(
        (q: any) => q.symbol && typeof q.symbol === 'string' && q.symbol.toUpperCase() === trimmed.toUpperCase()
      );
      if (exactTickerMatch && (exactTickerMatch as any).symbol) {
        return (exactTickerMatch as any).symbol;
      }

      // Find the first equity/stock item
      const equityQuote = quotes.find(
        (q: any) => q.quoteType === 'EQUITY' || (q.typeDisp && q.typeDisp.toLowerCase() === 'equity')
      );

      if (equityQuote && (equityQuote as any).symbol) {
        return (equityQuote as any).symbol;
      }

      // Fallback to the first quote that has a symbol
      const fallbackQuote = quotes.find((q: any) => q.symbol);
      if (fallbackQuote && (fallbackQuote as any).symbol) {
        return (fallbackQuote as any).symbol;
      }

      throw new Error(`Could not find a valid stock ticker for "${companyName}"`);
    } catch (error: any) {
      console.error('Ticker resolution error:', error);
      throw new Error(error.message || `Failed to resolve ticker for "${companyName}"`);
    }
  }

  /**
   * Fetches stock quote, summary profile, financials, historical statements and recent news for a ticker.
   */
  static async fetchCompanyData(ticker: string): Promise<CompanyData> {
    const uppercaseTicker = ticker.toUpperCase().trim();
    
    try {
      // 1. Fetch search for news (searching by ticker returns recent articles)
      const searchRes = await yahooFinance.search(uppercaseTicker).catch((err) => {
        console.error('Search for news error:', err);
        return { news: [], quotes: [] };
      });

      // 2. Fetch stock quote details
      const quote = await yahooFinance.quote(uppercaseTicker).catch((err) => {
        console.warn(`Quote fetch failed for ticker "${uppercaseTicker}":`, err.message);
        return {} as any;
      });

      // Optimize: Skip statement history modules for non-equity tickers (mutual funds, ETFs, indexes).
      // Yahoo Finance will time out or throw on these, causing seconds of latency trying to fetch statement history.
      const isEquity = quote.quoteType === 'EQUITY' || (quote.typeDisp && quote.typeDisp.toLowerCase() === 'equity');

      // 3. Fetch summary modules
      let summary: any = {};
      try {
        summary = await yahooFinance.quoteSummary(uppercaseTicker, {
          modules: isEquity ? [
            'summaryProfile',
            'financialData',
            'defaultKeyStatistics',
            'incomeStatementHistory',
            'balanceSheetHistory',
            'cashflowStatementHistory',
          ] : [
            'summaryProfile',
            'financialData',
            'defaultKeyStatistics',
          ],
        });
      } catch (err: any) {
        console.warn(`QuoteSummary modules failed for ticker "${uppercaseTicker}":`, err.message);
        // Try fallback to simpler profile and financialData modules
        try {
          summary = await yahooFinance.quoteSummary(uppercaseTicker, {
            modules: ['summaryProfile', 'financialData'],
          });
        } catch (innerErr: any) {
          console.warn(`Fallback QuoteSummary also failed for ticker "${uppercaseTicker}":`, innerErr.message);
        }
      }

      const profile = (summary.summaryProfile as any) || {};
      const financialData = (summary.financialData as any) || {};
      const keyStats = (summary.defaultKeyStatistics as any) || {};

      // Determine CEO name from officers (fallback to N/A, AI can fill it later)
      const officers = profile.companyOfficers || [];
      const ceoOfficer = officers.find(
        (o: any) =>
          o.title?.toLowerCase().includes('ceo') ||
          o.title?.toLowerCase().includes('chief executive officer')
      );
      const ceoName = ceoOfficer ? ceoOfficer.name : 'N/A';

      // Compile address/headquarters
      const addressParts = [
        profile.address1,
        profile.city,
        profile.state,
        profile.zip,
        profile.country,
      ].filter(Boolean);
      const headquarters = addressParts.join(', ') || 'N/A';

      // Map historical income statements for revenue/net income trends
      const historyList: HistoricalStatement[] = [];
      const incomeHistory = summary.incomeStatementHistory?.incomeStatementHistory || [];
      
      // Sort history chronologically (oldest to newest)
      const sortedIncomeHistory = [...incomeHistory].sort((a, b) => {
        if (!a.endDate || !b.endDate) return 0;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      });

      for (const statement of sortedIncomeHistory) {
        if (statement.endDate) {
          historyList.push({
            date: new Date(statement.endDate).toISOString().split('T')[0],
            revenue: statement.totalRevenue || null,
            netIncome: statement.netIncome || null,
          });
        }
      }

      // Map News
      const rawNews = searchRes.news || [];
      const news = rawNews.map((n: any) => ({
        title: n.title || 'No Title',
        publisher: n.publisher || 'Yahoo Finance',
        link: n.link || '#',
        publishedAt: n.providerPublishTime
          ? new Date(n.providerPublishTime).toISOString()
          : new Date().toISOString(),
      })).slice(0, 8); // Top 8 articles

      // Formulate resulting dataset
      return {
        profile: {
          name: quote.longName || quote.shortName || uppercaseTicker,
          ticker: uppercaseTicker,
          industry: profile.industryDisp || profile.industry || 'N/A',
          sector: profile.sectorDisp || profile.sector || 'N/A',
          ceo: ceoName,
          headquarters,
          description: profile.longBusinessSummary || 'No description available.',
          website: profile.website || '',
          employees: profile.fullTimeEmployees || null,
        },
        financials: {
          revenue: financialData.totalRevenue || null,
          netIncome: keyStats.netIncomeToCommon || null,
          eps: quote.epsTrailingTwelveMonths || null,
          marketCap: quote.marketCap || null,
          profitMargin: financialData.profitMargins || null,
          freeCashFlow: financialData.freeCashflow || null,
          debt: financialData.totalDebt || null,
          roe: financialData.returnOnEquity || null,
          revenueGrowth: financialData.revenueGrowth || null,
        },
        stockInfo: {
          currentPrice: quote.regularMarketPrice || null,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || null,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow || null,
          peRatio: quote.trailingPE || null,
          volume: quote.regularMarketVolume || null,
          currency: quote.financialCurrency || quote.currency || 'USD',
        },
        news,
        history: historyList,
      };
    } catch (error: any) {
      console.error(`Error fetching data for ticker ${ticker}:`, error);
      throw new Error(error.message || `Failed to fetch data for ticker "${ticker}"`);
    }
  }
}
