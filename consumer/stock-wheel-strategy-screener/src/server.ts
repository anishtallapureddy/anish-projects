import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { runDailyPipeline, DataMode } from './orchestrator';
import { runFeedbackAgent } from './agents/feedback';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Store latest pipeline result in memory
let latestResult: { report: any; email: string } | null = null;
let pipelineRunning = false;

// Run the daily pipeline
app.post('/api/run', async (req, res) => {
  if (pipelineRunning) {
    return res.status(409).json({ error: 'Pipeline already running' });
  }
  pipelineRunning = true;
  const mode: DataMode = req.body?.mode === 'live' ? 'live' : 'mock';
  try {
    latestResult = await runDailyPipeline(mode);
    res.json({ success: true, mode, report: latestResult.report, email: latestResult.email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    pipelineRunning = false;
  }
});

// Get latest report
app.get('/api/report', (_req, res) => {
  if (!latestResult) {
    return res.status(404).json({ error: 'No report yet. Run the pipeline first.' });
  }
  res.json({ report: latestResult.report, email: latestResult.email });
});

// Submit feedback
app.post('/api/feedback', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  try {
    const feedback = runFeedbackAgent(text);
    // Save feedback
    const outDir = path.resolve(__dirname, '../agents/out');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, `feedback-${feedback.date}.json`),
      JSON.stringify(feedback, null, 2)
    );
    res.json({ success: true, feedback });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List past runs
app.get('/api/runs', (_req, res) => {
  const outDir = path.resolve(__dirname, '../agents/out');
  if (!fs.existsSync(outDir)) return res.json({ runs: [] });
  const entries = fs.readdirSync(outDir)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
    .reverse();
  const runs = entries.map((date) => {
    const dir = path.join(outDir, date);
    const hasReport = fs.existsSync(path.join(dir, 'daily_report.json'));
    return { date, hasReport };
  });
  res.json({ runs });
});

// Get specific run
app.get('/api/runs/:date', (req, res) => {
  const dir = path.resolve(__dirname, `../agents/out/${req.params.date}`);
  const reportPath = path.join(dir, 'daily_report.json');
  const emailPath = path.join(dir, 'daily_email.md');
  if (!fs.existsSync(reportPath)) {
    return res.status(404).json({ error: 'Run not found' });
  }
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  const email = fs.existsSync(emailPath) ? fs.readFileSync(emailPath, 'utf-8') : '';
  res.json({ report, email });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`\n🎯 WheelAlpha Dashboard → http://localhost:${PORT}\n`);
});
