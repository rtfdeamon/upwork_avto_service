import { OpenAI } from 'openai';
import type { Redis } from 'ioredis';
import QuickLRU from 'quick-lru';
import { createHash } from 'crypto';
import { encoding_for_model as encodingForModel, type TiktokenModel } from '@dqbd/tiktoken';
import axios from 'axios';
import { log } from '../logger';
import { createPrompt } from './prompt/createPrompt';

export class OpenAITransientError extends Error {
  constructor(message = 'transient') {
    super(message);
  }
}
export class OpenAIPermanentError extends Error {
  constructor(message = 'permanent') {
    super(message);
  }
}

interface CreateClientOptions {
  apiKey?: string;
  organization?: string;
  redis?: Redis;
  client?: OpenAI;
}

const TOKENS_PER_MINUTE = Number(process.env.OPENAI_TPM || 200000);

const encoders = new Map<string, ReturnType<typeof encodingForModel>>();
function estimateTokens(text: string, model = 'gpt-4o') {
  const m = model as TiktokenModel;
  const enc =
    encoders.get(m) ??
    (() => {
      const e = encodingForModel(m);
      encoders.set(m, e);
      return e;
    })();
  return enc.encode(text).length;

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

  interface RunOpts {
    model: string;
    max_tokens?: number;
  }

  async function runCompletion(prompt: string, opts: RunOpts): Promise<string> {
    const hash = createHash('sha256').update(prompt + opts.model).digest('hex');
    let cached: string | null | undefined = cache.get(hash) ?? null;
    if (cached === null && redis) {
      cached = await redis.get(hash);
    }
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const tokens = estimateTokens(prompt, opts.model);
    await checkRateLimit(tokens + (opts.max_tokens ?? 0));

    try {
      const stream = await withRetry(
        () =>
          client.chat.completions.create({
            ...opts,
            stream: true,
            messages: [{ role: 'user', content: prompt }],
            functions: [
              {
                name: 'createProposal',
                parameters: {
                  type: 'object',
                  properties: {
                    headline: { type: 'string' },
                    body: { type: 'string' },
                    callToAction: { type: 'string' },
                  },
                  required: ['headline', 'body'],
                },
              },
            ],
          }),
        { tries: 5, factor: 2 },
      );

      let args = '';
      for await (const part of stream as any) {
        const delta = part.choices?.[0]?.delta;
        if (delta?.function_call?.arguments) {
          args += delta.function_call.arguments;
        }
      }

      let text = args;
      try {
        const obj = JSON.parse(args);
        text = [obj.headline, obj.body, obj.callToAction].filter(Boolean).join('\n\n');
      } catch {}

      cache.set(hash, text);
      if (redis) {
        await redis.set(hash, text, 'EX', 60 * 60);
      }
      return text;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const { status, data } = err.response;
        if (status === 429 && data?.error?.code === 'rate_limit_exceeded') {
          throw new OpenAITransientError('rate-limit');
        }
        if (status === 429 || status === 400) {
          throw new OpenAIPermanentError('policy');
        }
        if (status >= 500) throw new OpenAITransientError('5xx');
        throw new OpenAIPermanentError();
      }
      throw err;
    }

  }

  return {
    async generateDraft(profile: string, jobJson: any, cases: string[]): Promise<string> {
      const prompt = createPrompt(profile, jobJson, cases);
      log('generating draft');

      const primary = process.env.OPENAI_MODEL_PRIMARY || 'gpt-4o';
      const fallbacks = (process.env.OPENAI_MODEL_FALLBACK || 'gpt-4o-mini,gpt-3.5-turbo-0125').split(',');
      const models = [primary, ...fallbacks];

      for (const model of models) {
        try {
          return await runCompletion(prompt, { model, max_tokens: 200 });
        } catch (e) {
          if (!(e instanceof OpenAITransientError)) throw e;
          log(`model ${model} failed, trying fallback`);
        }
      }
      throw new OpenAITransientError('all models failed');
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
