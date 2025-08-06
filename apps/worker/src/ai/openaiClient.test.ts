import { describe, it, expect } from 'vitest';
import { createOpenAIClient } from './openaiClient';

function makeStub(result: string, errors: any[] = []) {
  let calls = 0;
  return {
    get calls() {
      return calls;
    },
    chat: {
      completions: {
        create: async () => {
          if (errors[calls]) {
            const err = errors[calls];
            calls++;
            throw err;
          }
          calls++;
          return { choices: [{ message: { content: result } }] };
        },
      },
    },
  } as any;
}

describe('openai client', () => {
  it('throws when API key missing', () => {
    expect(() => createOpenAIClient({ apiKey: '' })).toThrow('OPENAI_API_KEY missing');
  });

  it('caches responses', async () => {
    const stub = makeStub('hello');
    const client = createOpenAIClient({ apiKey: 'key', client: stub });
    const first = await client.generateDraft('p', { id: 1, title: 't' }, []);
    const second = await client.generateDraft('p', { id: 1, title: 't' }, []);
    expect(first).toBe('hello');
    expect(second).toBe('hello');
    expect(stub.calls).toBe(1);
  });

  it('retries on transient errors', async () => {
    const transient: any = new Error('temp');
    transient.status = 500;
    const stub = makeStub('ok', [transient]);
    const client = createOpenAIClient({ apiKey: 'key', client: stub });
    const result = await client.generateDraft('p', { id: 1, title: 't' }, []);
    expect(result).toBe('ok');
    expect(stub.calls).toBe(2);
  });
});
