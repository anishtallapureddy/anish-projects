import { NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/types';
import { generateAnalysis } from '@/lib/setup/generate';
import { buildMarkdownReport } from '@/lib/report/markdown';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = AnalyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const result = await generateAnalysis(parsed.data);
    const md = buildMarkdownReport(result);
    const filename = `edgedesk-${result.setup.symbol}-${result.setup.asOf.slice(0, 10)}.md`;
    return new NextResponse(md, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
