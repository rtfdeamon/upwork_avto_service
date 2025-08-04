import { OpenAI } from 'openai';
import type { Redis } from 'ioredis';
import QuickLRU from 'quick-lru';
import { createHash } from 'crypto';
import { log } from '../logger';

export class OpenAITransientError extends Error {}
export class OpenAIPermanentError extends Error {}

interface CreateClientOptions {
  apiKey?: string;
  organization?: string;
  redis?: Redis;
  client?: OpenAI;
}

const TOKENS_PER_MINUTE = Number(process.env.OPENAI_TPM || 200000);

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function createOpenAIClient(opts: CreateClientOptions = {}) {
  const apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY missing');
  }
  const client = opts.client ?? new OpenAI({ apiKey, organization: opts.organization });
  const cache = new QuickLRU<string, string>({ maxSize: 10000 });
  const redis = opts.redis;

  async function checkRateLimit(tokens: number) {
    if (!redis) return;
    const current = await redis.incrby('openai:tokens', tokens);
    if (current === tokens) {
      await redis.expire('openai:tokens', 60);
    }
    if (current > TOKENS_PER_MINUTE) {
      throw new OpenAITransientError('Token rate limit exceeded');
    }
  }

  async function runCompletion(prompt: string, params: { model: string; max_tokens?: number }): Promise<string> {
    const hash = createHash('sha256').update(prompt + params.model).digest('hex');
    let cached = cache.get(hash);
    if (!cached && redis) {
      cached = await redis.get(hash);
    }
    if (cached) {
      return cached;
    }

    await checkRateLimit(estimateTokens(prompt) + (params.max_tokens ?? 0));

    const response = await withRetry(async () => {
      try {
        return await client.chat.completions.create({
          model: params.model,
          messages: [
            { role: 'system', content: 'You write short Upwork proposals.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: params.max_tokens,
        });
      } catch (e: any) {
        const status = e?.status ?? e?.response?.status;
        if (status === 429 || (status && status >= 500)) {
          throw new OpenAITransientError(e.message);
        }
        throw new OpenAIPermanentError(e.message);
      }
    });

    const text = response.choices[0].message.content || '';
    cache.set(hash, text);
    if (redis) {
      await redis.set(hash, text, 'EX', 60 * 60);
    }
    return text;
  }

  return {
    async generateDraft(profile: string, jobJson: any, cases: string[]): Promise<string> {
      const prompt = `Write a brief proposal based on the job post and profile. Job: ${JSON.stringify(jobJson)} Profile: ${profile}\nCases: ${cases.join('\n')}`;
      log('generating draft');
      return runCompletion(prompt, { model: 'gpt-4o', max_tokens: 200 });
    },
  };
}

async function withRetry<T>(fn: () => Promise<T>, opts = { tries: 5, factor: 2 }): Promise<T> {
  let attempt = 0;
  let delay = 200;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= opts.tries || err instanceof OpenAIPermanentError) {
        throw err;
      }
      await new Promise((res) => setTimeout(res, delay));
      delay *= opts.factor;
    }
  }
}

export type OpenAIClient = ReturnType<typeof createOpenAIClient>;
