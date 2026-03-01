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

// Seed mock data on startup
console.log('\n🏗️  DFW CRE Investment Analyzer');
console.log('================================\n');
const { count } = seedMockData();
console.log(`📊 Database: ${count} commercial properties loaded`);

app.listen(PORT, () => {
  console.log(`\n🎯 Dashboard → http://localhost:${PORT}`);
  console.log(`📡 API       → http://localhost:${PORT}/api/v1/properties`);
  console.log(`🗺️  Map Data  → http://localhost:${PORT}/api/v1/properties/map`);
  console.log(`📈 Market    → http://localhost:${PORT}/api/v1/market/summary\n`);
});
