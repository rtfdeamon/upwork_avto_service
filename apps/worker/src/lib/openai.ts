import { OpenAI } from 'openai';
import { log, error } from '../logger';

const key = process.env.OPENAI_API_KEY;
const client = key ? new OpenAI({ apiKey: key }) : null;

export async function generateDraft(
  profile: string,
  jobJson: any,
  cases: string[],
): Promise<string> {
  const prompt = `Write a brief proposal based on the job post and profile. Job: ${JSON.stringify(jobJson)} Profile: ${profile} Cases: ${cases.join('\n')}`;
  if (!client) {
    return `DRAFT: ${jobJson.title}`;
  }
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You write short Upwork proposals.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
    });
    log('draft generated');
    return completion.choices[0].message.content || '';
  } catch (e: any) {
    error('openai error', e.message);
    throw e;
  }
}
