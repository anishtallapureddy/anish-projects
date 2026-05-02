import type { AnalyzeResponse } from '@/types';

function fmt(n: number | null | undefined, dp = 2): string {
  if (n == null || Number.isNaN(n)) return 'n/a';
  return n.toFixed(dp);
}

export function buildMarkdownReport(data: AnalyzeResponse): string {
  const { quote, indicators, setup, news, llmProvider } = data;
  const lines: string[] = [];
  lines.push(`# EdgeDesk Research Note — ${quote.symbol}`);
  if (quote.name) lines.push(`**${quote.name}**`);
  lines.push('');
  lines.push(`> Generated ${new Date().toISOString()} · LLM: \`${llmProvider}\``);
  lines.push('');
  if (setup.degraded) {
    lines.push(`> ⚠️ **Degraded result.** ${setup.degradedReasons.join(' ')}`);
    lines.push('');
  }
  lines.push('## Snapshot');
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Latest available price | $${fmt(quote.price)} (${fmt(quote.changePercent, 2)}%) |`);
  lines.push(`| Exchange | ${quote.exchange ?? 'n/a'} |`);
  lines.push(`| 52w range | $${fmt(quote.fiftyTwoWeekLow)} – $${fmt(quote.fiftyTwoWeekHigh)} |`);
  lines.push(`| Trend | ${indicators.trend} |`);
  lines.push(`| RSI(14) | ${fmt(indicators.rsi14, 1)} |`);
  lines.push(
    `| MACD | ${
      indicators.macd
        ? `${fmt(indicators.macd.macd, 3)} / sig ${fmt(indicators.macd.signal, 3)} / hist ${fmt(indicators.macd.histogram, 3)}`
        : 'n/a'
    } |`,
  );
  lines.push(`| SMA20 / 50 / 200 | $${fmt(indicators.sma20)} / $${fmt(indicators.sma50)} / $${fmt(indicators.sma200)} |`);
  lines.push(`| ATR(14) | ${fmt(indicators.atr14)} |`);
  lines.push('');
  lines.push('## Setup');
  lines.push('');
  lines.push(`- **Direction:** ${setup.direction.toUpperCase()}`);
  lines.push(`- **Style / Timeframe:** ${setup.style} / ${setup.timeframe}`);
  lines.push(`- **Conviction:** ${setup.conviction}/10`);
  lines.push(`- **Entry zone:** $${fmt(setup.entryLow)} – $${fmt(setup.entryHigh)}`);
  lines.push(`- **Targets:** T1 $${fmt(setup.target1)} · T2 $${fmt(setup.target2)}`);
  lines.push(`- **Stop:** $${fmt(setup.stop)}`);
  lines.push(`- **R:R (to T1):** ${fmt(setup.rr)}`);
  lines.push('');
  lines.push('### Thesis');
  lines.push('');
  lines.push(setup.thesis);
  lines.push('');
  lines.push('### Triggers');
  lines.push('');
  setup.triggers.forEach((t) => lines.push(`- ${t}`));
  lines.push('');
  lines.push('### Risk notes');
  lines.push('');
  lines.push(setup.riskNotes);
  lines.push('');
  lines.push('## Options structures (illustrative only)');
  lines.push('');
  lines.push('> Strikes are selected mechanically from spot price + ATR offsets. Does not model Greeks, IV rank/skew, liquidity, bid/ask spread, commissions, or assignment risk. Verify live chain before any trade.');
  lines.push('');
  setup.optionsPlays.forEach((p) => {
    lines.push(`### ${p.label} — ${p.structure} (${p.riskRating} risk)`);
    if (p.shortStrike != null && p.longStrike != null) {
      lines.push(`- Long: $${fmt(p.longStrike)}  ·  Short: $${fmt(p.shortStrike)}`);
    } else {
      lines.push(`- Strike: $${fmt(p.strike)}`);
    }
    lines.push(`- Expiry hint: ${p.expiryHint}`);
    lines.push(`- ${p.rationale}`);
    lines.push('');
  });
  lines.push('## Recent headlines');
  lines.push('');
  if (news.length === 0) lines.push('_No headlines available._');
  news.forEach((n) => {
    const date = n.publishedAt ? n.publishedAt.slice(0, 10) : '';
    lines.push(`- [${n.title}](${n.link}) ${n.publisher ? `· _${n.publisher}_` : ''} ${date}`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(
    '**Disclaimer.** EdgeDesk is a personal research prototype. Market data is sourced via Yahoo Finance through an unofficial wrapper and may be delayed, incomplete, or unavailable. All setups, levels, and options structures are illustrative — not financial advice and not orders. Verify with your broker and your own analysis before trading.',
  );
  return lines.join('\n');
}
