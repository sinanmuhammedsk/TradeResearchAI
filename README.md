# AI Investment Research Agent

An autonomous, full-stack web dashboard that dynamically researches public companies, compiles their real-time financial statements and news headlines, and uses Google Gemini via LangChain.js to generate institutional-grade investment recommendations.

---

## 🚀 Key Features

* **Zero-DB Dynamic Pipeline**: No hardcoded data. Scrapes live Yahoo Finance stats and news for any company worldwide.
* **Smart Ticker Resolution**: Resolves queries like "Apple" or "Tesla" to their respective tickers (e.g. `AAPL`, `TSLA`, `RELIANCE.NS`) automatically.
* **Institutional-Grade AI Analysis**: Employs LangChain and Gemini 1.5 Flash to analyze financial statements, run SWOT analyses, outline key risk vectors, and output structured recommendations (`INVEST`, `HOLD`, or `PASS`) with a confidence level.
* **Modern Dark Dashboard**: Built with a sleek space-dark theme using **Tailwind CSS v4** featuring interactive visual indicators.
* **52-Week Range Gauge**: A custom UI slider mapping where the current stock price sits relative to its 52-week low and high.
* **Multi-Axis SVG Chart**: A custom, zero-dependency SVG line and bar chart plotting historical Revenue and Net Income over a 4-year trend.
* **Safe Markdown Engine**: A custom React renderer that formats Gemini's markdown investment thesis directly into clean HTML tags without heavy third-party packages.

---

## 🏗️ Architecture Design

```
             ┌──────────────────────────────────────────────────────────┐
             │                  Next.js Dashboard UI                    │
             │   (Page.tsx - Inputs, Loading Checklist, Badges, Charts) │
             └─────────────┬──────────────────────────────▲─────────────┘
                           │ POST /api/analyze            │
                           │ { companyName }              │ JSON Report
                           ▼                              │
             ┌────────────────────────────────────────────┴─────────────┐
             │               Next.js Route Handler                      │
             │               (src/app/api/analyze)                      │
             └─────────────┬────────────────────────────────────────────┘
                           │
                           │ 1. Resolve Ticker (e.g. "Apple" -> "AAPL")
                           │ 2. Scrape Profile, Financials, & News
                           ▼
             ┌──────────────────────────────────────────────────────────┐
             │                Yahoo Finance Service                     │
             │             (src/services/yahooFinance.ts)               │
             └─────────────┬────────────────────────────────────────────┘
                           │
                           │ 3. Compile Raw Structured Context
                           ▼
             ┌──────────────────────────────────────────────────────────┐
             │                    AI Agent Service                      │
             │               (src/services/aiAgent.ts)                  │
             │          - LangChain + ChatGoogleGenerativeAI            │
             │          - Structured JSON Output Enforcement            │
             └─────────────┬────────────────────────────────────────────┘
                           │
                           │ 4. Send formatted prompt with data
                           ▼
             ┌──────────────────────────────────────────────────────────┐
             │              Google Gemini AI (LLM API)                  │
             │           (Returns structured analysis JSON)             │
             └──────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
├── .env.local                  # Local API configurations (GEMINI_API_KEY)
├── package.json                # Project configurations & npm package manager
├── tsconfig.json               # TypeScript compiler options
├── next.config.ts              # Next.js bundler settings
├── src/
│   ├── services/
│   │   ├── yahooFinance.ts     # Scraper class for live stocks, news & historical data
│   │   └── aiAgent.ts          # LangChain wrapper for Google Gemini analysis
│   └── app/
│       ├── api/
│       │   └── analyze/
│       │       └── route.ts    # POST route for request routing & sanitization
│       ├── globals.css         # Tailwind v4 setup & custom dark-mode variables
│       ├── layout.tsx          # Main html root page frame
│       └── page.tsx            # Full Dashboard UI & client state managers
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js LTS (v24+)
- npm (v11+)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install Dependencies
Navigate to the root workspace and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory (a boilerplate template has already been created for you as `.env.local`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build for Production
To build the application for deployment or staging, compile using:
```bash
npm run build
```

---

## 🔑 Required API Keys

1. **`GEMINI_API_KEY` (Required)**: Needed to authenticate requests to the Google Gemini model. Available for free (within generous rate limits) in Google AI Studio.
2. **Financial Data & News APIs (None Required)**: This application interfaces with Yahoo Finance via `yahoo-finance2` using anonymous HTTP socket calls. This completely bypasses the need for costly Financial Modeling Prep, Finnhub, or Alpha Vantage API keys!

---

## ⚖️ Technical Tradeoffs & Decisions

### 1. Scraper (`yahoo-finance2`) vs. Paid Financial APIs
- **Tradeoff**: Paid APIs (FMP, Alpha Vantage) offer structured JSON arrays with strict SLAs but require API keys with strict monthly call limits on free tiers.
- **Decision**: Used `yahoo-finance2` because it fetches raw live statements and quotes directly from Yahoo Finance without any keys, which allows this project to work immediately out-of-the-box.
- **Mitigation**: To protect against Yahoo changing its undocumented endpoints, the service includes extensive fallback error handlers that throw user-friendly suggestions when symbol properties are undefined.

### 2. Custom SVG Charting vs. Chart Libraries (Recharts/Chart.js)
- **Tradeoff**: Standard libraries (Recharts) provide ready-made tooltips and complex responsive scaling but can lead to dependency conflicts under Next.js server components or compilation errors due to canvas rendering.
- **Decision**: Developed a custom SVG chart. It has **zero bundle size overhead**, is **100% server-component compatible**, and enables precise style customization (custom gradients, grid line dashes, node highlights) matching the dark-theme CSS dashboard natively.

### 3. Custom Markdown Parsing vs. `react-markdown`
- **Tradeoff**: External markdown packages are robust but bring in large trees of sub-dependencies which can lead to ESM/CJS transpilation warnings in Next.js.
- **Decision**: Implemented a lightweight, safe regex-based line parser in `page.tsx` that maps headers, bolding, blockquotes, and lists to Tailwind-styled React tags. This keeps the client bundle thin and eliminates package vulnerabilities.

---

## 🔮 Future Improvements

1. **Caching and Rate Limiting**: Implement a Redis-based cache on `/api/analyze` to save company reports for 12 hours. This mitigates duplicate scrapers and keeps Gemini usage efficient.
2. **Competitor Comparison**: Enhance the AI prompt to pull data for secondary resolved symbols (e.g. comparing AAPL vs MSFT) to draw comparison charts.
3. **PDF Thesis Export**: Add a client-side print button mapping the dashboard analysis grid into a clean PDF research report.
