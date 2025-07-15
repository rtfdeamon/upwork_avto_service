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
}
