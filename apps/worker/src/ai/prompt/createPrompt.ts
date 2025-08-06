import { JobJson } from '../../types/job';
import { escapeLine } from '../utils/escapeLine';

export function createPrompt(profile: string, job: JobJson, cases: string[]) {
  return [
    'You are an Upwork proposal writer.',
    `## Profile\n${escapeLine(profile)}`,
    `## Job\n${escapeLine(JSON.stringify(job))}`,
    cases.length ? `## Cases\n${cases.map(escapeLine).join('\n')}` : '',
    'Respond strictly via createProposal() function.',
  ].join('\n\n');
}
