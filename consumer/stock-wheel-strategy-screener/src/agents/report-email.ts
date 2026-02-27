import { DailyReport, Opportunity, BlockedOpportunity, OrderDraft } from '../types';

export function runReportAgent(report: DailyReport): string {
  const lines: string[] = [];

  lines.push(`# WheelAlpha Daily — ${report.date}`);
  lines.push('');

  // Market Regime
  lines.push('## 📊 Market Regime');
  lines.push('');
  lines.push(`**${report.market_regime.regime}** — ${report.market_regime.risk_posture}`);
  lines.push('');
  lines.push(report.market_regime.notes);
  lines.push('');

  // Group approved by category
  const byCategory: Record<string, Opportunity[]> = {};
  for (const opp of report.approved_opportunities) {
    (byCategory[opp.category] = byCategory[opp.category] || []).push(opp);
  }

  // CSP
  if (byCategory['CSP']?.length) {
    lines.push('## 💰 Cash-Secured Put Opportunities');
    lines.push('');
    lines.push('| # | Symbol | Score | Rationale | Flags |');
    lines.push('|---|--------|-------|-----------|-------|');
    byCategory['CSP'].forEach((opp, i) => {
      lines.push(`| ${i + 1} | ${opp.symbol} | ${opp.score} | ${opp.rationale} | ${opp.risk_flags.join(', ') || '—'} |`);
    });
    lines.push('');
  }

  // CC
  if (byCategory['CC']?.length) {
    lines.push('## 📈 Covered Call Opportunities');
    lines.push('');
    lines.push('| # | Symbol | Score | Rationale | Flags |');
    lines.push('|---|--------|-------|-----------|-------|');
    byCategory['CC'].forEach((opp, i) => {
      lines.push(`| ${i + 1} | ${opp.symbol} | ${opp.score} | ${opp.rationale} | ${opp.risk_flags.join(', ') || '—'} |`);
    });
    lines.push('');
  }

  // Value
  if (byCategory['VALUE']?.length) {
    lines.push('## 🏦 Long-Term Value Picks');
    lines.push('');
    byCategory['VALUE'].forEach((opp) => {
      lines.push(`- **${opp.symbol}** (score: ${opp.score}) — ${opp.rationale}`);
    });
    lines.push('');
  }

  // ETF
  if (byCategory['ETF']?.length) {
    lines.push('## 🌐 ETF Allocation');
    lines.push('');
    byCategory['ETF'].forEach((opp) => {
      lines.push(`- **${opp.symbol}** (score: ${opp.score}) — ${opp.rationale}`);
    });
    lines.push('');
  }

  // Draft Orders
  if (report.order_drafts.length) {
    lines.push('## 📋 Draft Orders (NOT SUBMITTED)');
    lines.push('');
    lines.push('| Order ID | Type | Symbol | Qty | Details | Price |');
    lines.push('|----------|------|--------|-----|---------|-------|');
    for (const draft of report.order_drafts) {
      const details = draft.option
        ? `${draft.option.put_call} $${draft.option.strike} exp ${draft.option.expiry}`
        : 'shares';
      const price = draft.limit_price ? `$${draft.limit_price}` : 'MKT';
      lines.push(`| ${draft.order_id} | ${draft.type} | ${draft.symbol} | ${draft.quantity} | ${details} | ${price} |`);
    }
    lines.push('');
    lines.push('> ⚠️ **These are draft orders only.** Reply with approval commands to execute.');
    lines.push('');
  }

  // Blocked
  if (report.blocked_opportunities.length) {
    lines.push('<details>');
    lines.push('<summary>🚫 Blocked Opportunities (' + report.blocked_opportunities.length + ')</summary>');
    lines.push('');
    for (const b of report.blocked_opportunities) {
      lines.push(`- **${b.opportunity.symbol}** (${b.opportunity.category}): ${b.reason}`);
    }
    lines.push('');
    lines.push('</details>');
    lines.push('');
  }

  // Feedback instructions
  lines.push('---');
  lines.push('');
  lines.push('## 💬 Feedback Commands');
  lines.push('');
  lines.push('```');
  lines.push('APPROVE: <order_id1>, <order_id2>');
  lines.push('REJECT: <order_id>');
  lines.push('SET_RULE: wheel.csp_delta_range=[0.18,0.25]');
  lines.push('ADD_TO_LIST: watchlists.wheel_universe+=TSM');
  lines.push('REMOVE_FROM_LIST: watchlists.wheel_universe-=NVDA');
  lines.push('NOTE: <any freeform note>');
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}
