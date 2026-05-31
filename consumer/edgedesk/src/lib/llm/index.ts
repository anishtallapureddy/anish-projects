import { mockProvider } from './mock';
import { makeOpenAIProvider } from './openai';
import type { LlmProvider } from './types';

export function getLlmProvider(): LlmProvider {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.EDGEDESK_LLM_MODEL || 'gpt-4o-mini';
  if (key && key.trim().length > 0) {
    return makeOpenAIProvider(key.trim(), model);
  }
  return mockProvider;
}

export type { LlmProvider } from './types';
