import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ApiKey } from '../entities/api-key.entity';

@Injectable()
export class UpworkService {
  private readonly log = new Logger(UpworkService.name);

  async createProposal(apiKey: ApiKey, jobId: string, coverLetter: string) {
    this.log.log(`submit proposal ${jobId}`);
    if (!process.env.UPWORK_MOCK) {
      await axios.post(
        'https://www.upwork.com/api/graphql',
        { query: 'mutation { CreateProposal }' },
        { headers: { Authorization: `Bearer ${apiKey.upworkKey}` } },
      );
    }
  }

  async searchJobs(apiKey: ApiKey, query?: string) {
    if (process.env.UPWORK_MOCK) {
      return [
        { id: 'mock-1', title: 'Mock Frontend task' },
        { id: 'mock-2', title: 'Mock Backend API' },
      ];
    }
    const q = query ? query.replace(/"/g, '\\"') : '';
    // minimal placeholder GraphQL; adjust to real schema as needed
    const gql = q
      ? `{ JobSearch(q: "${q}") { id title } }`
      : `{ JobSearch { id title } }`;
    try {
      const res = await axios.post(
        'https://www.upwork.com/api/graphql',
        { query: gql },
        { headers: { Authorization: `Bearer ${apiKey.upworkKey}` } },
      );
      return res.data?.data?.JobSearch || [];
    } catch (e: any) {
      this.log.error('searchJobs failed', e?.message);
      throw e;
    }
  }
}
