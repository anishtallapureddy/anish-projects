'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import SetupCard from '@/components/SetupCard';
import TickerSearch from '@/components/TickerSearch';
import type { AnalyzeResponse, Style, Timeframe } from '@/types';

const PriceChart = dynamic(() => import('@/components/PriceChart'), { ssr: false });

const TIMEFRAMES: Timeframe[] = ['swing', 'momentum', 'positional'];
const STYLES: Style[] = ['technical', 'breakout', 'earnings', 'contrarian'];

function fmtN(n: number | null | undefined, dp = 2) {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toFixed(dp);
}

function fmtBig(n: number | null | undefined) {
  if (n == null) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(0)}`;
}

export default function Home() {
  const [timeframe, setTimeframe] = useState<Timeframe>('swing');
  const [style, setStyle] = useState<Style>('technical');
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(symbol: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, timeframe, style }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to analyze');
      setData(json as AnalyzeResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function exportReport() {
    if (!data) return;
    setExporting(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: data.setup.symbol,
          timeframe: data.setup.timeframe,
          style: data.setup.style,
        }),
      });
      if (!res.ok) throw new Error('Failed to export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edgedesk-${data.setup.symbol}-${data.setup.asOf.slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edge<span className="text-edge-accent">Desk</span>
          </h1>
          <p className="text-xs text-edge-mute">
            Trading & research prototype · US equities & options · personal use only
          </p>
        </div>
      </header>

      <section className="panel p-4 space-y-4">
        <TickerSearch onSubmit={analyze} loading={loading} />
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-edge-mute text-xs uppercase">Timeframe</span>
            <div className="flex gap-1">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2 py-1 text-xs rounded border ${
                    timeframe === t
                      ? 'border-edge-accent text-edge-accent'
                      : 'border-edge-border text-edge-mute'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-edge-mute text-xs uppercase">Style</span>
            <div className="flex gap-1">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-2 py-1 text-xs rounded border ${
                    style === s
                      ? 'border-edge-accent text-edge-accent'
                      : 'border-edge-border text-edge-mute'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="panel p-4 text-sm text-edge-down border-edge-down/40">
          {error}
        </div>
      )}

      {data && (
        <>
          <section className="panel p-5 space-y-3">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <div className="text-xs text-edge-mute">{data.quote.exchange ?? ''}</div>
                <h2 className="text-2xl font-semibold">
                  {data.quote.symbol}
                  {data.quote.name && (
                    <span className="text-edge-mute font-normal text-base ml-2">
                      {data.quote.name}
                    </span>
                  )}
                </h2>
              </div>
              <div className="text-right">
                <div className="font-mono text-2xl">${fmtN(data.quote.price)}</div>
                <div
                  className={`font-mono text-sm ${
                    data.quote.change >= 0 ? 'text-edge-up' : 'text-edge-down'
                  }`}
                >
                  {data.quote.change >= 0 ? '+' : ''}
                  {fmtN(data.quote.change)} ({fmtN(data.quote.changePercent, 2)}%)
                </div>
                <div className="text-[10px] text-edge-mute">
                  Latest available · {new Date(data.quote.asOf).toLocaleTimeString()} · LLM:{' '}
                  {data.llmProvider}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <div className="text-edge-mute uppercase">52w range</div>
                <div className="font-mono">
                  ${fmtN(data.quote.fiftyTwoWeekLow)} – ${fmtN(data.quote.fiftyTwoWeekHigh)}
                </div>
              </div>
              <div>
                <div className="text-edge-mute uppercase">Market cap</div>
                <div className="font-mono">{fmtBig(data.quote.marketCap)}</div>
              </div>
              <div>
                <div className="text-edge-mute uppercase">Volume</div>
                <div className="font-mono">{fmtBig(data.quote.volume)}</div>
              </div>
              <div>
                <div className="text-edge-mute uppercase">Trend</div>
                <div className="font-mono uppercase">{data.indicators.trend}</div>
              </div>
              <div>
                <div className="text-edge-mute uppercase">RSI(14)</div>
                <div className="font-mono">{fmtN(data.indicators.rsi14, 1)}</div>
              </div>
            </div>
            <PriceChart candles={data.history} />
          </section>

          <section className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SetupCard setup={data.setup} onExport={exportReport} exporting={exporting} />
            </div>
            <aside className="space-y-4">
              <div className="panel p-4">
                <h3 className="text-sm uppercase text-edge-mute mb-2 tracking-wider">
                  Indicators
                </h3>
                <ul className="text-xs space-y-1 font-mono">
                  <li>
                    SMA20 <span className="float-right">${fmtN(data.indicators.sma20)}</span>
                  </li>
                  <li>
                    SMA50 <span className="float-right">${fmtN(data.indicators.sma50)}</span>
                  </li>
                  <li>
                    SMA200 <span className="float-right">${fmtN(data.indicators.sma200)}</span>
                  </li>
                  <li>
                    ATR14 <span className="float-right">{fmtN(data.indicators.atr14)}</span>
                  </li>
                  <li>
                    MACD hist{' '}
                    <span className="float-right">
                      {data.indicators.macd ? fmtN(data.indicators.macd.histogram, 3) : '—'}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="panel p-4">
                <h3 className="text-sm uppercase text-edge-mute mb-2 tracking-wider">
                  Headlines
                </h3>
                {data.news.length === 0 && (
                  <p className="text-xs text-edge-mute">No headlines available.</p>
                )}
                <ul className="space-y-2">
                  {data.news.map((n, i) => (
                    <li key={i} className="text-xs">
                      <a
                        href={n.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-edge-accent hover:underline"
                      >
                        {n.title}
                      </a>
                      <div className="text-[10px] text-edge-mute">
                        {n.publisher ?? ''} {n.publishedAt ? `· ${n.publishedAt.slice(0, 10)}` : ''}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </section>
        </>
      )}

      {!data && !loading && (
        <div className="panel p-8 text-center text-edge-mute text-sm">
          Enter a US ticker (or pick a suggestion) to generate a structured setup, options
          structures, and a downloadable research note.
        </div>
      )}

      <footer className="text-[11px] text-edge-mute pt-4 border-t border-edge-border">
        EdgeDesk is a personal research prototype. Market data sourced via Yahoo Finance through
        an unofficial wrapper — may be delayed, incomplete, or unavailable. All setups, levels, and
        options structures are illustrative only — not financial advice and not orders.
      </footer>
    </main>
  );
}
