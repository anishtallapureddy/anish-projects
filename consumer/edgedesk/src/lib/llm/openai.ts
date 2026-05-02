import OpenAI from 'openai';
import { z } from 'zod';
import type { LlmContext, LlmProvider, LlmThesis } from './types';
import { mockProvider } from './mock';

const ResponseSchema = z.object({
  thesis: z.string().min(20).max(1200),
  riskNotes: z.string().min(10).max(800),
  triggers: z.array(z.string().min(3).max(160)).min(1).max(6),
  conviction: z.number().min(1).max(10),
});

export function makeOpenAIProvider(apiKey: string, model: string): LlmProvider {
  const client = new OpenAI({ apiKey });
  return {
    name: `openai:${model}`,
    async generateThesis(ctx: LlmContext): Promise<LlmThesis> {
      const sys = [
        'You are a disciplined trading analyst. You DO NOT invent or alter numeric trade levels.',
        'You are given precomputed entry, target, stop, and indicators. Respect them exactly.',
        'Return ONLY a JSON object with: thesis (string), riskNotes (string), triggers (string[1-6]), conviction (integer 1-10).',
        'No financial advice. Be concise and concrete.',
      ].join(' ');

      const user = JSON.stringify({
        symbol: ctx.quote.symbol,
        name: ctx.quote.name,
        price: ctx.quote.price,
        timeframe: ctx.timeframe,
        style: ctx.style,
        direction: ctx.direction,
        entryLow: ctx.entryLow,
        entryHigh: ctx.entryHigh,
        target1: ctx.target1,
        target2: ctx.target2,
        stop: ctx.stop,
        rr: ctx.rr,
        indicators: ctx.indicators,
        recentNewsTitles: ctx.recentNewsTitles.slice(0, 5),
      });

      try {
        const completion = await client.chat.completions.create({
          model,
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: user },
          ],
        });
        const raw = completion.choices[0]?.message?.content ?? '{}';
        const parsed = ResponseSchema.safeParse(JSON.parse(raw));
        if (!parsed.success) throw new Error('LLM JSON validation failed');
        return parsed.data;
      } catch {
        return mockProvider.generateThesis(ctx);
      }
    },
  };
}
