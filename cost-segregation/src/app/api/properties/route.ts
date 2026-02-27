import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const DEMO_USER_ID = 'demo-user';

function ensureDemoUser() {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(DEMO_USER_ID);
  if (!existing) {
    db.prepare('INSERT INTO users (id, email, name, plan) VALUES (?, ?, ?, ?)').run(
      DEMO_USER_ID, 'demo@costsegpro.com', 'Demo User', 'pro'
    );
  }
}

export async function GET() {
  ensureDemoUser();
  const db = getDb();
  const properties = db.prepare(
    'SELECT * FROM properties WHERE user_id = ? ORDER BY created_at DESC'
  ).all(DEMO_USER_ID);
  return NextResponse.json(properties.map((p: any) => ({
    ...p,
    features: p.features ? JSON.parse(p.features) : null,
    renovations: p.renovations ? JSON.parse(p.renovations) : [],
  })));
}

export async function POST(req: NextRequest) {
  ensureDemoUser();
  const db = getDb();
  const body = await req.json();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO properties (id, user_id, address, purchase_price, land_value, building_type, year_built, acquisition_date, square_footage, number_of_units, features, renovations)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    DEMO_USER_ID,
    body.address || '',
    body.purchasePrice,
    body.landValue,
    body.buildingType,
    body.yearBuilt,
    body.acquisitionDate,
    body.squareFootage,
    body.numberOfUnits || 1,
    JSON.stringify(body.features || {}),
    JSON.stringify(body.renovations || [])
  );

  return NextResponse.json({ id }, { status: 201 });
}
