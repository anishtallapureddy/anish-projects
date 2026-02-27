import { Feedback, FeedbackAction } from '../types';
import { format } from 'date-fns';

export function runFeedbackAgent(rawText: string): Feedback {
  const today = format(new Date(), 'yyyy-MM-dd');
  const actions: FeedbackAction[] = [];

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // APPROVE: ord-csp-abc123, ord-cc-def456
    if (/^APPROVE:/i.test(line)) {
      const ids = line.replace(/^APPROVE:\s*/i, '').split(',').map((s) => s.trim()).filter(Boolean);
      for (const id of ids) {
        actions.push({ type: 'APPROVE', payload: { order_id: id } });
      }
      continue;
    }

    // REJECT: ord-csp-abc123
    if (/^REJECT:/i.test(line)) {
      const ids = line.replace(/^REJECT:\s*/i, '').split(',').map((s) => s.trim()).filter(Boolean);
      for (const id of ids) {
        actions.push({ type: 'REJECT', payload: { order_id: id } });
      }
      continue;
    }

    // SET_RULE: wheel.csp_delta_range=[0.18,0.25]
    if (/^SET_RULE:/i.test(line)) {
      const expr = line.replace(/^SET_RULE:\s*/i, '');
      const [path, value] = expr.split('=');
      if (path && value) {
        let parsedValue: unknown;
        try { parsedValue = JSON.parse(value); } catch { parsedValue = value; }
        actions.push({ type: 'SET_RULE', payload: { path: path.trim(), value: parsedValue } });
      }
      continue;
    }

    // ADD_TO_LIST: watchlists.wheel_universe+=TSM
    if (/^ADD_TO_LIST:/i.test(line)) {
      const expr = line.replace(/^ADD_TO_LIST:\s*/i, '');
      const match = expr.match(/^(.+?)\+=(.+)$/);
      if (match) {
        actions.push({ type: 'ADD_TO_LIST', payload: { path: match[1].trim(), item: match[2].trim() } });
      }
      continue;
    }

    // REMOVE_FROM_LIST: watchlists.wheel_universe-=NVDA
    if (/^REMOVE_FROM_LIST:/i.test(line)) {
      const expr = line.replace(/^REMOVE_FROM_LIST:\s*/i, '');
      const match = expr.match(/^(.+?)-=(.+)$/);
      if (match) {
        actions.push({ type: 'REMOVE_FROM_LIST', payload: { path: match[1].trim(), item: match[2].trim() } });
      }
      continue;
    }

    // NOTE: anything else
    if (/^NOTE:/i.test(line)) {
      const note = line.replace(/^NOTE:\s*/i, '');
      actions.push({ type: 'NOTE', payload: { text: note } });
      continue;
    }

    // Unrecognized lines treated as notes
    actions.push({ type: 'NOTE', payload: { text: line } });
  }

  return { date: today, actions };
}
