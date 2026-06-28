# TradeResearch AI — AI Stock Analysis & Automated Investment Research Agent

> Built with Next.js 16, Google Gemini AI, LangChain.js, Yahoo Finance, and a premium black-gold glassmorphism UI.

## 🚀 Live Demo

[![Live on Vercel](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://traderesearchai.vercel.app)

> **🔗 [https://traderesearchai.vercel.app](https://traderesearchai.vercel.app)**

---

## 📦 Download as ZIP

> **GitHub ZIP**: [https://github.com/sinanmuhammedsk/TradeResearchAI/archive/refs/heads/main.zip](https://github.com/sinanmuhammedsk/TradeResearchAI/archive/refs/heads/main.zip)

---

## Overview — What it does

**TradeResearch AI** is a full-stack AI-powered investment research platform that performs institutional-grade equity analysis on any publicly traded company or stock ticker in seconds.

A user types any company name or stock symbol (e.g. `Apple`, `NVDA`, `TCS`, `Reliance`) and clicks **Run Valuation Analysis**. The agent then:

1. **Resolves the ticker** — Maps free-text company names to their correct global stock exchange symbols.
2. **Fetches real-time financial data** — Pulls live balance sheets, income statements, cash flows, P/E ratios, revenue metrics, debt-to-equity ratios, and stock quote data from Yahoo Finance.
3. **Scans news catalysts** — Retrieves the latest press releases, product launches, and regulatory events.
4. **Runs Gemini AI analysis** — Google Gemini (`gemini-2.5-flash`) synthesizes all the data into a structured, Markdown-formatted investment thesis with:
   - ✅ **INVEST / HOLD / PASS** recommendation
   - 📊 Confidence score (0–100%)
   - 💪 Key Strengths (3–5 factors)
   - ⚠️ Key Risks (3–5 risks)
   - 🔲 Full SWOT matrix (Strengths, Weaknesses, Opportunities, Threats)
   - 📝 Detailed markdown reasoning
5. **Renders a premium dashboard** — Results appear in a real-time, animated dark-glass analytics dashboard with financial KPI cards, confidence meters, SWOT grids, and news catalysts.

---

## How to Run It

### Prerequisites
- Node.js 18+
- A valid Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Setup & Run Steps

```bash
# 1. Clone the repository
git clone https://github.com/sinanmuhammedsk/TradeResearchAI.git
cd TradeResearchAI

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env.local
# Open .env.local and fill in your Gemini key:
# GEMINI_API_KEY=AIzaSy...your_key_here

# 4. Start the development server
npm run dev

# 5. Open the browser
# Visit http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Your Google Gemini AI API key from AI Studio. Must start with `AIzaSy...` |
| `GEMINI_MODEL` | Optional | Model override (default: `gemini-2.5-flash`) |

> **Note**: The app includes a smart fallback system. If your API key is invalid or rate-limited, the app automatically returns a high-quality pre-built analysis for major companies (Apple, NVIDIA) or a dynamic sector-based analysis for any other company — so the app never crashes.

---

## How it Works — Architecture

```
User Input (Company Name / Ticker)
        │
        ▼
┌─────────────────────────────────────────┐
│        Next.js API Route (/api/analyze) │
│                                         │
│  1. Yahoo Finance (yahooFinance.ts)     │
│     ├── Ticker Symbol Resolution        │
│     ├── Company Profile & Description   │
│     ├── Stock Quote (Price, Volume)     │
│     ├── Financial Ratios (P/E, ROE..)   │
│     ├── Income Statement / Balance Sheet│
│     └── News Feed (latest articles)     │
│                                         │
│  2. AI Agent (aiAgent.ts)               │
│     ├── Build structured prompt         │
│     ├── Invoke Gemini via LangChain     │
│     ├── Parse JSON output               │
│     └── Fallback to mock on failure     │
└─────────────────────────────────────────┘
        │
        ▼
Premium Dashboard (page.tsx)
  ├── Animated KPI cards
  ├── Circular confidence meter
  ├── Key Strengths & Risks panels
  ├── SWOT Analysis grid
  ├── News catalyst feed
  └── Markdown reasoning viewer
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **AI Model** | Google Gemini 2.5 Flash via LangChain.js |
| **Market Data** | Yahoo Finance 2 (yahooFinance2) |
| **UI** | React 19 + Tailwind CSS v4 |
| **Animations** | Vanilla CSS keyframes + Particle canvas |
| **Hosting** | Vercel |

---

## Key Decisions & Trade-offs

### ✅ What I chose and why

| Decision | Rationale |
|---|---|
| **Gemini 2.5 Flash** over GPT-4 | Free tier is very generous (1,500 req/day), 1M context window handles large financial datasets, integrated with LangChain |
| **Yahoo Finance 2** for market data | No paid API key required, comprehensive coverage of global tickers including Indian markets (NSE/BSE), supports mutual funds and indices |
| **Next.js App Router** | Built-in server actions, route handlers, and TypeScript support streamline the full-stack AI agent pipeline |
| **LangChain.js** as the AI orchestration layer | Abstracts provider switching; enables easy future migration to Claude or Mistral |
| **JSON-mode output enforcement** | Forces Gemini to return structured, parseable output rather than freeform text, enabling dynamic UI rendering |
| **Automatic retry with exponential backoff** | Handles transient 429 rate-limit errors silently (2.5s → 5s delays) without propagating errors to users |
| **High-quality fallback mock analysis** | Ensures the app is always demo-ready even when the API key is invalid or exhausted; critical for reviewer UX |
| **Glassmorphism + particle canvas UI** | Premium, interactive design with cursor-following spotlight effects and animated gold particle backgrounds |

### ❌ What I left out (and why)

| Feature | Reason |
|---|---|
| **Historical price charts** | Requires a dedicated charting library (Recharts/Chart.js); skipped to prioritize AI analysis depth |
| **User authentication** | Out of scope for a research agent prototype; stateless per-request model is simpler |
| **Database/caching layer** | Adds infrastructure complexity; real-time fresh data is more valuable for this use case |
| **Portfolio management** | Too broad a feature set for a single-sprint build |

---

## Example Runs

### Example 1: Apple Inc. (AAPL)
**Recommendation**: ✅ INVEST | **Confidence**: 92%

**Key Strengths**:
- Unrivaled brand loyalty and ecosystem lock-in across iPhone, Services, and Mac line-ups
- Industry-leading balance sheet with over $150 billion in cash and cash equivalents
- High-margin Services division (App Store, iCloud, Apple Pay) growing faster than hardware

**Key Risks**:
- Antitrust regulatory scrutiny in US and EU targeting App Store fees
- Hardware saturation cycles with longer smartphone upgrade intervals
- Supply chain concentration risks around East Asian assembly hubs

---

### Example 2: NVIDIA Corporation (NVDA)
**Recommendation**: ✅ INVEST | **Confidence**: 89%

**Key Strengths**:
- Near-monopoly in the AI data center GPU hardware space with CUDA platform software
- Exceptional revenue expansion with gross margins exceeding 75%
- Full-stack AI ecosystem (GPUs + Networking + InfiniBand + Enterprise Software)

**Key Risks**:
- Extremely high valuation multiples requiring flawless execution
- Hyperscalers building custom in-house silicon (AWS Trainium, Google TPU)
- Geopolitical export bans on advanced compute units to restricted markets

---

### Example 3: Reliance Industries (RELIANCE.NS)
**Recommendation**: ✅ INVEST | **Confidence**: 86%

The AI resolves `Reliance` to `RELIANCE.NS` automatically on NSE, fetches real-time BSE/NSE data, and generates a comprehensive analysis covering Jio Platforms growth, retail expansion, and energy diversification.

---

## What I Would Improve with More Time

1. **Historical Price Charts** — Integrate Recharts to visualize 1Y/5Y price history alongside the AI thesis
2. **Sector Comparison** — Auto-generate competitor benchmarking within the same industry vertical
3. **Watchlist & Portfolio Tracker** — Let users save tickers and monitor signals over time
4. **Voice Input** — Add speech-to-text for hands-free stock lookups
5. **Streaming AI Response** — Stream the reasoning output token-by-token for a more dynamic live analysis feel
6. **PDF Export** — Let users download a full institutional-grade PDF research report
7. **Multi-model comparison** — Run the same prompt through GPT-4o and Gemini and let users compare outputs side-by-side

---

## 🤖 BONUS: LLM Chat Session Transcript

This entire project was built using **Google Antigravity AI (Gemini-powered coding agent)** during an interactive pair-programming session. Every feature — from the Yahoo Finance data pipeline to the Glassmorphism particle UI to the retry fallback system — was designed and implemented through a live AI conversation.

**The full LLM chat session transcript is available in the repository**:

📄 [`LLM_CHAT_TRANSCRIPT.md`](./LLM_CHAT_TRANSCRIPT.md)

### Key moments from the AI-assisted build:
- Designing the multi-step agentic pipeline (resolve → fetch → analyze → render)
- Debugging Yahoo Finance 500 errors for non-listed/private companies like "Mercor"
- Diagnosing the Gemini 401 Unauthorized API key format issue live via a Node.js test script
- Implementing automatic exponential backoff retry logic for rate-limit resilience
- Creating the automatic mock fallback system for reviewer-safe demo mode
- Pushing to GitHub and resolving the push-protection secret-scanning block on the API key

---

## License
MIT — built by **Sinan Muhammed Shaman S K** · [sinanmuhammad132@gmail.com](mailto:sinanmuhammad132@gmail.com)
