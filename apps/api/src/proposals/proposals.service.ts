import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Proposal, ProposalFeedback, ProposalStatus } from '../entities/proposal.entity';
import { Cron } from '@nestjs/schedule';
import { promises as fs } from 'fs';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal) private proposals: Repository<Proposal>,
  ) {}

  listForUser(userId: string, status?: ProposalStatus) {
    const where: any = { user: { id: userId } };
    if (status) where.status = status;
    return this.proposals.find({ where });
  }

  async setFeedback(id: string, feedback: ProposalFeedback) {
    await this.proposals.update({ id }, { feedback });
  }

  async findOwned(id: string, userId: string) {
    return this.proposals.findOne({
      where: { id, user: { id: userId } },
      relations: ['apiKey'],
    });
  }

  async markSent(id: string) {
    await this.proposals.update(
      { id },
      { status: ProposalStatus.SENT, sentAt: new Date() },
    );
  }

  @Cron('0 2 * * *')
  async exportFeedback() {
    const rows = await this.proposals.find({
      where: { feedback: Not(IsNull()) },
      order: { createdAt: 'DESC' },
      take: 200,
    });
    await fs.mkdir('fine-tune', { recursive: true });
    await fs.writeFile(
      `fine-tune/feedback-${Date.now()}.json`,
      JSON.stringify(rows, null, 2),
    );
  }
}
