import * as fs from 'fs';
import * as readline from 'readline';
import { runFeedbackAgent } from './agents/feedback';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function prompt(q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve));
}

(async () => {
  console.log('💬 WheelAlpha Feedback CLI');
  console.log('Enter feedback commands (one per line). Type "done" to finish.\n');
  console.log('Commands:');
  console.log('  APPROVE: <order_id1>, <order_id2>');
  console.log('  REJECT: <order_id>');
  console.log('  SET_RULE: wheel.csp_delta_range=[0.18,0.25]');
  console.log('  ADD_TO_LIST: watchlists.wheel_universe+=TSM');
  console.log('  REMOVE_FROM_LIST: watchlists.wheel_universe-=NVDA');
  console.log('  NOTE: <any note>');
  console.log('');

  const lines: string[] = [];
  while (true) {
    const line = await prompt('> ');
    if (line.trim().toLowerCase() === 'done') break;
    if (line.trim()) lines.push(line.trim());
  }

  if (lines.length === 0) {
    console.log('No feedback entered.');
    rl.close();
    return;
  }

  const feedback = runFeedbackAgent(lines.join('\n'));
  console.log('\n📋 Parsed Feedback:');
  console.log(JSON.stringify(feedback, null, 2));

  // Save
  const outPath = `agents/out/feedback-${feedback.date}.json`;
  fs.mkdirSync('agents/out', { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(feedback, null, 2));
  console.log(`\n✅ Saved to ${outPath}`);
  rl.close();
})();
