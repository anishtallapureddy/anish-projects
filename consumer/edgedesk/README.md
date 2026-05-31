# EdgeDesk

A personal trading & research prototype for **US equities and options**. Enter a ticker and EdgeDesk pulls live market data, computes technicals, and generates a structured trade setup — entry zone, targets, stop, R:R, conviction, options structures, and a downloadable Markdown research note.

> Personal research prototype. **Not financial advice. Not an order entry tool.**

![EdgeDesk dashboard placeholder](./screenshots/01-dashboard-placeholder.png)

## What it does

- 🔎 **Ticker search** — quick-pick suggestions or type any US symbol
- 📈 **Latest available quote** — price, change, 52w range, market cap, volume
- 🕯️ **90-day candlestick chart** via [TradingView lightweight-charts](https://tradingview.github.io/lightweight-charts/)
- 📊 **Indicators** — RSI(14), MACD, SMA20/50/200, ATR(14), trend classification
- 🎯 **Structured setup** — direction, entry zone, T1/T2, stop, R:R, conviction, triggers, risk notes
- 🧠 **LLM thesis** — pluggable provider (default OpenAI `gpt-4o-mini`); falls back to a deterministic mock when no API key is set, so the app always works offline
- 🪙 **Options structures (illustrative)** — primary (long call/put) + aggressive (vertical spread) sized off ATR
- 📰 **Recent headlines** from Yahoo Finance
- 📥 **Markdown report export** for any setup

## Architectural rules

1. **Numbers are deterministic.** Entry / target / stop / R:R / option strikes are computed from quote + ATR + recent swing structure. The LLM never invents or alters numeric levels — it only writes `thesis`, `riskNotes`, `triggers`, and a clamped `conviction`.
2. **All market data calls are server-side** (Next.js route handlers). Yahoo is never called from the browser.
3. **All structured output is validated with [zod](https://zod.dev/)** before being returned or rendered.
4. **Graceful degradation.** Missing options chain or news doesn't break the setup; level sanity checks flag `degraded: true` and surface reasons in the UI.

## Run locally

```bash
cd consumer/edgedesk
npm install
cp .env.example .env.local   # optional; add OPENAI_API_KEY for richer thesis text
npm run dev
# open http://localhost:3000
```

### Build / lint

```bash
npm run build
npm run lint
```

## Configuration

| Env var               | Default          | Purpose                                                              |
| --------------------- | ---------------- | -------------------------------------------------------------------- |
| `OPENAI_API_KEY`      | _(unset)_        | Enables OpenAI thesis generation. Without it, the deterministic mock provider is used. |
| `EDGEDESK_LLM_MODEL`  | `gpt-4o-mini`    | OpenAI chat model id.                                                |

## API

| Method | Path                       | Body                                  | Returns                                |
| ------ | -------------------------- | ------------------------------------- | -------------------------------------- |
| GET    | `/api/quote/[symbol]`      | —                                     | Latest quote JSON                      |
| POST   | `/api/analyze`             | `{ symbol, timeframe, style }`        | `AnalyzeResponse` (quote + indicators + setup + news + 90d history) |
| POST   | `/api/report`              | `{ symbol, timeframe, style }`        | `text/markdown` attachment             |

`timeframe` ∈ `swing | momentum | positional`  
`style` ∈ `technical | breakout | earnings | contrarian`

## Honest limitations

- **Market data** is sourced via Yahoo Finance through the unofficial `yahoo-finance2` wrapper. It may be delayed, incomplete, or temporarily unavailable. For real entries, cross-reference your broker.
- **Options structures are illustrative only.** Strikes are mechanically derived from spot price + ATR offsets. The tool **does not** model Greeks, IV rank/skew, liquidity, bid/ask spread, commissions, taxes, or assignment/exercise risk.
- **No real-time streaming.** Snapshots are fetched on demand and cached briefly server-side.
- **No brokerage integration.** EdgeDesk never sends orders.
- **No auth / multi-user.** This is a personal-use prototype.

## Tech

- [Next.js 14](https://nextjs.org/) · App Router · TypeScript · Tailwind CSS
- [`yahoo-finance2`](https://www.npmjs.com/package/yahoo-finance2) — quotes, history, news, options chain
- [`technicalindicators`](https://www.npmjs.com/package/technicalindicators) — RSI / MACD / SMA / ATR
- [`lightweight-charts`](https://www.npmjs.com/package/lightweight-charts) — candlestick rendering
- [`openai`](https://www.npmjs.com/package/openai) — pluggable LLM (default provider)
- [`zod`](https://www.npmjs.com/package/zod) — schema validation

## Layout

```
consumer/edgedesk/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── quote/[symbol]/route.ts
│   │   │   ├── analyze/route.ts
│   │   │   └── report/route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── OptionsPlay.tsx
│   │   ├── PriceChart.tsx
│   │   ├── SetupCard.tsx
│   │   └── TickerSearch.tsx
│   ├── lib/
│   │   ├── indicators/compute.ts
│   │   ├── llm/{index,types,openai,mock}.ts
│   │   ├── market/yahoo.ts
│   │   ├── report/markdown.ts
│   │   └── setup/generate.ts
│   └── types/index.ts
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```
