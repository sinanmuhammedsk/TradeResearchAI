import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { CompanyData } from './yahooFinance';

export interface AIAnalysisResult {
  ceo: string;
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

export class AIAgentService {
  /**
   * Run Gemini AI analysis using LangChain on the dynamically compiled company financial profile and news.
   */
  static async analyze(companyData: CompanyData): Promise<AIAnalysisResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Missing Gemini API Key. Please configure the GEMINI_API_KEY environment variable in .env.local'
      );
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    // Instantiate ChatGoogleGenerativeAI with json output enabled
    const model = new ChatGoogleGenerativeAI({
      apiKey,
      model: modelName,
      temperature: 0.2,
      maxOutputTokens: 8192, // Prevent response truncation
      json: true, // Forces JSON output from the Gemini API
    });

    const systemPrompt = `You are an expert Wall Street financial analyst and investment research agent.
Your task is to analyze the provided company's profile, financial metrics, stock market quote, and recent news to generate a comprehensive investment thesis.

You must output a JSON object adhering exactly to the following TypeScript schema:
{
  "ceo": string, // If the provided CEO name is "N/A" or incorrect, use your knowledge/search capabilities to fill in the correct current CEO name. Otherwise, keep the provided name.
  "strengths": string[], // 3 to 5 key investment strengths/drivers (bullet points).
  "risks": string[], // 3 to 5 key investment risks/tailwinds (bullet points).
  "swot": {
    "strengths": string[],
    "weaknesses": string[],
    "opportunities": string[],
    "threats": string[]
  },
  "recommendation": "INVEST" | "HOLD" | "PASS",
  "confidenceScore": number, // An integer between 0 and 100 representing your conviction level in this recommendation.
  "reasoning": string // Detailed, structured investment thesis in Markdown format. Cover financial health, competitive landscape, valuation, growth drivers, and risk factors. Write professionally and quantitatively.
}

CRITICAL RULES:
1. Ensure the "reasoning" string is well-structured, professional, but concise (limit to 500-750 words) to avoid token truncation issues.
2. Strictly escape all control characters, double quotes, and newlines within the "reasoning" string to produce valid parseable JSON.
3. Do not include any markdown wrappers (like \`\`\`json) or text outside the JSON object. Return only the raw JSON.`;

    // format monetary outputs
    const currency = companyData.stockInfo.currency;
    const formatNumber = (val: number | null) => {
      if (val === null) return 'N/A';
      if (val >= 1e12) return `${(val / 1e12).toFixed(2)}T`;
      if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
      if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
      return val.toLocaleString();
    };

    const humanPrompt = `Analyze the following company data and news:

Company Profile:
- Name: ${companyData.profile.name}
- Ticker: ${companyData.profile.ticker}
- Sector: ${companyData.profile.sector}
- Industry: ${companyData.profile.industry}
- Current CEO (according to data): ${companyData.profile.ceo}
- Headquarters: ${companyData.profile.headquarters}
- Website: ${companyData.profile.website}
- Description: ${companyData.profile.description}

Stock Quote & Valuation:
- Current Price: ${companyData.stockInfo.currentPrice !== null ? companyData.stockInfo.currentPrice.toFixed(2) : 'N/A'} ${currency}
- 52-Week Range: ${companyData.stockInfo.fiftyTwoWeekLow !== null ? companyData.stockInfo.fiftyTwoWeekLow.toFixed(2) : 'N/A'} - ${companyData.stockInfo.fiftyTwoWeekHigh !== null ? companyData.stockInfo.fiftyTwoWeekHigh.toFixed(2) : 'N/A'} ${currency}
- Volume: ${companyData.stockInfo.volume !== null ? companyData.stockInfo.volume.toLocaleString() : 'N/A'}
- Market Cap: ${formatNumber(companyData.financials.marketCap)} ${currency}
- P/E Ratio: ${companyData.stockInfo.peRatio !== null ? companyData.stockInfo.peRatio.toFixed(2) : 'N/A'}

Recent Financial Metrics:
- Total Revenue: ${formatNumber(companyData.financials.revenue)} ${currency}
- Net Income: ${formatNumber(companyData.financials.netIncome)} ${currency}
- EPS: ${companyData.financials.eps !== null ? companyData.financials.eps.toFixed(2) : 'N/A'}
- Profit Margin: ${companyData.financials.profitMargin !== null ? (companyData.financials.profitMargin * 100).toFixed(2) + '%' : 'N/A'}
- ROE: ${companyData.financials.roe !== null ? (companyData.financials.roe * 100).toFixed(2) + '%' : 'N/A'}
- Revenue Growth (YoY): ${companyData.financials.revenueGrowth !== null ? (companyData.financials.revenueGrowth * 100).toFixed(2) + '%' : 'N/A'}
- Total Debt: ${formatNumber(companyData.financials.debt)} ${currency}
- Free Cash Flow: ${formatNumber(companyData.financials.freeCashFlow)} ${currency}

Recent News Articles:
${companyData.news.length > 0
  ? companyData.news.map((item, idx) => `[News ${idx + 1}] Title: ${item.title}\nPublisher: ${item.publisher}\nDate: ${item.publishedAt}\nLink: ${item.link}`).join('\n\n')
  : 'No recent news articles found.'
}

Please perform a rigorous financial and qualitative analysis. Ensure that if the CEO name is listed as "N/A", you search your internal knowledge base and identify the correct current CEO of the company and put it in the "ceo" field of the JSON output. Provide a final recommendation ("INVEST", "HOLD", or "PASS"), a confidence score, list of key strengths and risks, a SWOT analysis, and detailed markdown reasoning.`;

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const response = await model.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(humanPrompt),
        ]);

        const text = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        const cleaned = text.trim();
        
        const result: AIAnalysisResult = JSON.parse(cleaned);
        return result;
      } catch (error: any) {
        attempt++;
        const errorMessage = error.message || "";
        const isRateLimit = errorMessage.includes("429") || error.status === 429 || errorMessage.toLowerCase().includes("quota") || errorMessage.toLowerCase().includes("limit");

        if (isRateLimit && attempt < maxRetries) {
          const delay = attempt * 2500;
          console.warn(`[AI Agent] Rate limit or quota error encountered. Retrying in ${delay}ms (Attempt ${attempt}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error(`[AI Agent] Analysis failed on attempt ${attempt} of ${maxRetries}:`, error);
          throw new Error(error.message || error);
        }
      }
    }
    throw new Error("AI agent analysis failed: Max retry limits exceeded.");
  }
}
