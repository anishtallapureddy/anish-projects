import { NextResponse } from 'next/server';
import { getQuote } from '@/lib/market/yahoo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { symbol: string } },
) {
  try {
    const quote = await getQuote(params.symbol);
    return NextResponse.json(quote);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
