import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal, ProposalStatus } from '../entities/proposal.entity';
import { Conversation } from '../entities/conversation.entity';
import { Metric } from '../entities/metric.entity';

@Injectable()
export class MetricsCron {
  private readonly log = new Logger(MetricsCron.name);
  constructor(
    @InjectRepository(Proposal) private proposals: Repository<Proposal>,
    @InjectRepository(Conversation) private convos: Repository<Conversation>,
    @InjectRepository(Metric) private metrics: Repository<Metric>,
  ) {}

  @Cron('0 * * * *')
  async rollup() {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const sentRows = await this.proposals
      .createQueryBuilder('p')
      .select('p.userId', 'userId')
      .addSelect('COUNT(*)', 'sent')
      .where('p.status = :status', { status: ProposalStatus.SENT })
      .andWhere('p.sentAt >= :start', { start })
      .andWhere('p.sentAt < :end', { end })
      .groupBy('p.userId')
      .getRawMany<{ userId: string; sent: string }>();

    const replyRows = await this.convos
      .createQueryBuilder('c')
      .select('c.userId', 'userId')
      .addSelect('COUNT(*)', 'replies')
      .where('c.ts >= :start', { start })
      .andWhere('c.ts < :end', { end })
      .groupBy('c.userId')
      .getRawMany<{ userId: string; replies: string }>();

    const map: Record<string, { sent: number; replies: number }> = {};
    for (const r of sentRows) {
      map[r.userId] = { sent: parseInt(r.sent, 10), replies: 0 };
    }
    for (const r of replyRows) {
      map[r.userId] = map[r.userId] || { sent: 0, replies: 0 };
      map[r.userId].replies = parseInt(r.replies, 10);
    }

    for (const userId of Object.keys(map)) {
      let row = await this.metrics.findOne({ where: { day: start, userId } });
      if (row) {
        row.sent = map[userId].sent;
        row.replies = map[userId].replies;
      } else {
        row = this.metrics.create({
          day: start,
          userId,
          sent: map[userId].sent,
          replies: map[userId].replies,
          wins: 0,
        });
      }
      await this.metrics.save(row);
    }
    this.log.log(`rolled up metrics for ${Object.keys(map).length} users`);
  }
}
