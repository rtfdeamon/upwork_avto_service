import axios from 'axios';
import { log, error } from '../logger';

export interface Job {
  id: string;
  title: string;
  postedAt?: string;
}

export async function searchJobs(token: string) {
  // minimal example calling Upwork GraphQL
  const query = '{ JobSearch { id title } }';
  try {
    const res = await axios.post(
      'https://www.upwork.com/api/graphql',
      { query },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data?.data?.JobSearch || [];
  } catch (e: any) {
    error('searchJobs failed', e.message);
    return [];
  }
}

export async function createProposal(
  token: string,
  jobId: string,
  body: string,
  connects: number,
) {
  // placeholder for CreateProposal mutation
  log('submit proposal', jobId, 'with', connects, 'connects');
  if (!process.env.UPWORK_MOCK) {
    try {
      await axios.post(
        'https://www.upwork.com/api/graphql',
        { query: 'mutation { CreateProposal }' },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (e: any) {
      error('CreateProposal failed', e.message);
      throw e;
    }
  }
}

export async function submitProposal(
  token: string,
  jobId: string,
  body: string,
  connects: number,
): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await createProposal(token, jobId, body, connects);
      log(`proposal submitted on attempt ${attempt}`);
      return;
    } catch (e) {
      if (attempt === 3) throw e;
      error('submitProposal retry', (e as any).message);
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

export interface ActivityMessage {
  id: string;
  jobId: string;
  jobTitle?: string;
  snippet: string;
  ts: string;
  author: string;
}

export async function fetchActivityFeed(token: string): Promise<ActivityMessage[]> {
  const query = '{ ActivityFeed { id jobId jobTitle snippet ts author } }';
  try {
    const res = await axios.post(
      'https://www.upwork.com/api/graphql',
      { query },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data?.data?.ActivityFeed || [];
  } catch (e: any) {
    error('fetchActivityFeed failed', e.message);
    return [];
  }
}
