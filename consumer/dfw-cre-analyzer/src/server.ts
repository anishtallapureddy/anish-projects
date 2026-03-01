import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes/api';
import { seedMockData } from './data/mock-provider';

const app = express();
const PORT = parseInt(process.env.PORT || '4002');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/v1', apiRoutes);

// Live ingestion endpoint (supports Zillow and LoopNet providers)
app.post('/api/v1/ingest', async (req, res) => {
  try {
    if (!process.env.RAPIDAPI_KEY) {
      return res.status(400).json({ error: 'RAPIDAPI_KEY not configured. Set it in environment to enable live mode.' });
    }
    const provider = req.body?.provider || 'loopnet'; // default to LoopNet (CRE-focused)
    const maxZips = req.body?.maxZips || req.body?.maxLocations || 5;
    const enrichTop = req.body?.enrichTop || 15;

    console.log(`\n🌐 Live ingestion triggered — Provider: ${provider.toUpperCase()}`);

    let result;
    if (provider === 'zillow') {
      const { runLiveIngestion } = await import('./data/live-provider');
      result = await runLiveIngestion({ maxZips, enrichTop });
    } else {
      const { runLoopNetIngestion } = await import('./data/loopnet-provider');
      result = await runLoopNetIngestion({ maxPages: 2, enrichCount: maxZips || 30 });
    }
    res.json({ success: true, provider, ...result });
  } catch (err: any) {
    console.error('Ingestion error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Seed mock data on startup
console.log('\n🏗️  DFW CRE Investment Analyzer');
console.log('================================\n');
const { count } = seedMockData();
console.log(`📊 Database: ${count} commercial properties loaded`);
const hasApiKey = !!process.env.RAPIDAPI_KEY;
console.log(`🔑 Live Mode: ${hasApiKey ? '✅ RAPIDAPI_KEY configured' : '⚠️  Set RAPIDAPI_KEY for live Zillow data'}`);

app.listen(PORT, () => {
  console.log(`\n🎯 Dashboard → http://localhost:${PORT}`);
  console.log(`📡 API       → http://localhost:${PORT}/api/v1/properties`);
  console.log(`🗺️  Map Data  → http://localhost:${PORT}/api/v1/properties/map`);
  console.log(`📈 Market    → http://localhost:${PORT}/api/v1/market/summary`);
  if (hasApiKey) {
    console.log(`🌐 Live      → POST http://localhost:${PORT}/api/v1/ingest`);
  }
  console.log('');
});
