import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { classifyProperty, PropertyInput } from '@/lib/classification';
import { calculateDepreciation } from '@/lib/depreciation';
import { v4 as uuidv4 } from 'uuid';

const DEMO_USER_ID = 'demo-user';

export async function GET() {
  const db = getDb();
  const reports = db.prepare(
    'SELECT r.*, p.address, p.purchase_price FROM reports r JOIN properties p ON r.property_id = p.id WHERE r.user_id = ? ORDER BY r.created_at DESC'
  ).all(DEMO_USER_ID);
  return NextResponse.json(reports.map((r: any) => ({
    ...r,
    classification: r.classification ? JSON.parse(r.classification) : null,
    depreciation: r.depreciation ? JSON.parse(r.depreciation) : null,
  })));
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { propertyId, taxRate = 0.37, discountRate = 0.06 } = body;

  // Load property
  const prop = db.prepare('SELECT * FROM properties WHERE id = ?').get(propertyId) as any;
  if (!prop) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

  const features = prop.features ? JSON.parse(prop.features) : {};
  const renovations = prop.renovations ? JSON.parse(prop.renovations) : [];

  const propertyInput: PropertyInput = {
    purchasePrice: prop.purchase_price,
    landValue: prop.land_value,
    buildingType: prop.building_type,
    yearBuilt: prop.year_built,
    acquisitionDate: prop.acquisition_date,
    squareFootage: prop.square_footage,
    numberOfUnits: prop.number_of_units,
    features,
    renovations,
  };

  // Run classification and depreciation
  const classification = classifyProperty(propertyInput);
  const depreciation = calculateDepreciation(classification, taxRate, discountRate);

  // Save report
  const reportId = uuidv4();
  db.prepare(`
    INSERT INTO reports (id, property_id, user_id, classification, depreciation, tax_rate, discount_rate, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')
  `).run(
    reportId,
    propertyId,
    DEMO_USER_ID,
    JSON.stringify(classification),
    JSON.stringify(depreciation),
    taxRate,
    discountRate
  );

  return NextResponse.json({
    id: reportId,
    classification,
    depreciation,
  }, { status: 201 });
}
