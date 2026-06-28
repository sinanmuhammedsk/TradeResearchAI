import { NextRequest, NextResponse } from 'next/server';
import { YahooFinanceService } from '@/services/yahooFinance';
import { AIAgentService } from '@/services/aiAgent';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate company name
    const body = await req.json().catch(() => ({}));
    const { companyName } = body;

    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      return NextResponse.json(
        { error: 'Please provide a valid company name.' },
        { status: 400 }
      );
    }

    console.log(`[API Analyze] Resolving ticker for company: "${companyName}"...`);
    
    // 2. Resolve ticker name
    let ticker: string;
    try {
      ticker = await YahooFinanceService.resolveTicker(companyName);
    } catch (err: any) {
      console.error(`[API Analyze] Ticker resolution failed for "${companyName}":`, err);
      return NextResponse.json(
        { 
          error: `Could not resolve a stock ticker for "${companyName}". Please check the spelling or try entering the ticker symbol directly (e.g. AAPL, TSLA, RELIANCE.NS).` 
        },
        { status: 404 }
      );
    }

    console.log(`[API Analyze] Ticker resolved: "${ticker}". Fetching financial data & news...`);

    // 3. Fetch financial and news data
    let companyData;
    try {
      companyData = await YahooFinanceService.fetchCompanyData(ticker);
    } catch (err: any) {
      console.error(`[API Analyze] Data fetch failed for ticker "${ticker}":`, err);
      return NextResponse.json(
        { 
          error: `Failed to retrieve financial data for ticker "${ticker}". This symbol might be inactive or restricted. Please try a different company name.` 
        },
        { status: 500 }
      );
    }

    console.log(`[API Analyze] Data retrieved. Running LangChain AI analysis...`);

    // 4. Run AI Agent analysis
    let aiAnalysis;
    try {
      aiAnalysis = await AIAgentService.analyze(companyData);
    } catch (err: any) {
      console.error(`[API Analyze] AI analysis failed for ticker "${ticker}":`, err);
      
      // Check specifically for missing API key configuration
      if (err.message?.includes('Missing Gemini API Key')) {
        return NextResponse.json(
          { 
            error: 'Gemini API Key is not configured on the server. Please add GEMINI_API_KEY to your environment variables.' 
          },
          { status: 501 }
        );
      }

      return NextResponse.json(
        { 
          error: `AI analysis failed for "${companyData.profile.name}" (${ticker}). The AI service might be temporarily rate-limited or unavailable. Please try again in a few moments.` 
        },
        { status: 502 }
      );
    }

    // 5. Update the CEO name in the profile if the AI resolved/corrected it
    if (aiAnalysis.ceo && aiAnalysis.ceo !== 'N/A' && companyData.profile.ceo === 'N/A') {
      companyData.profile.ceo = aiAnalysis.ceo;
    }

    console.log(`[API Analyze] Success! Analysis complete for ${companyData.profile.name}.`);

    // 6. Return response
    return NextResponse.json({
      company: companyData,
      analysis: {
        strengths: aiAnalysis.strengths,
        risks: aiAnalysis.risks,
        swot: aiAnalysis.swot,
        recommendation: aiAnalysis.recommendation,
        confidenceScore: aiAnalysis.confidenceScore,
        reasoning: aiAnalysis.reasoning,
      }
    });

  } catch (error: any) {
    console.error('[API Analyze] Unexpected server error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected server error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
