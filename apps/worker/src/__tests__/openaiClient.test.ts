import { describe, it, expect, vitest } from 'vitest';
import { createOpenAIClient } from '../ai/openaiClient';
import { mock } from 'vitest-mock-extended';

describe('openaiClient', () => {
  const mockOpenAI = mock<any>();
  mockOpenAI.chat = { completions: { create: vitest.fn() } } as any;

  it('falls back to mini when 5xx', async () => {
    mockOpenAI.chat.completions.create
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockResolvedValueOnce(
        (async function* () {
          yield { choices: [{ delta: { function_call: { arguments: '{}' } } }] } as any;
        })(),
      );
    const client = createOpenAIClient({ apiKey: 'x', client: mockOpenAI });
    await expect(client.generateDraft('p', {}, [])).resolves.not.toThrow();
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
  });
});
