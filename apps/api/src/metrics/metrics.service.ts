import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal, ProposalStatus } from '../entities/proposal.entity';
import { Conversation } from '../entities/conversation.entity';
import { Metric } from '../entities/metric.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Proposal) private proposals: Repository<Proposal>,
    @InjectRepository(Conversation) private convos: Repository<Conversation>,
    @InjectRepository(Metric) private metrics: Repository<Metric>,
  ) {}

  async summary(userId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const sentRows = await this.proposals
      .createQueryBuilder('p')
      .select("date_trunc('day', p.sentAt)", 'day')
      .addSelect('COUNT(*)', 'sent')
      .where('p.userId = :userId', { userId })
      .andWhere('p.status = :status', { status: ProposalStatus.SENT })
      .andWhere('p.sentAt >= :since', { since })
      .groupBy('day')
      .getRawMany<{ day: Date; sent: string }>();

    const replyRows = await this.convos
      .createQueryBuilder('c')
      .select("date_trunc('day', c.ts)", 'day')
      .addSelect('COUNT(*)', 'replies')
      .where('c.userId = :userId', { userId })
      .andWhere('c.ts >= :since', { since })
      .groupBy('day')
      .getRawMany<{ day: Date; replies: string }>();

    const map: Record<string, { sent: number; replies: number }> = {};
    for (const r of sentRows) {
      const day = r.day.toISOString().slice(0, 10);
      map[day] = { sent: parseInt(r.sent, 10), replies: 0 };
    }
    for (const r of replyRows) {
      const day = r.day.toISOString().slice(0, 10);
      map[day] = map[day] || { sent: 0, replies: 0 };
      map[day].replies = parseInt(r.replies, 10);
    }

    const daily = Object.entries(map)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([day, { sent, replies }]) => ({
        day,
        sent,
        replies,
        winRate: sent ? replies / sent : 0,
      }));

    const totals = daily.reduce(
      (acc, d) => {
        acc.sent += d.sent;
        acc.replies += d.replies;
        return acc;
      },
      { sent: 0, replies: 0 },
    );
    return { daily, totals };
  }

  async series(userId: string, days: number, kind: 'sent' | 'replies' | 'wins') {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await this.metrics
      .createQueryBuilder('m')
      .select('m.day', 'day')
      .addSelect(`m.${kind}`, 'value')
      .where('m.userId = :userId', { userId })
      .andWhere('m.day >= :since', { since })
      .orderBy('m.day', 'ASC')
      .getRawMany<{ day: Date; value: string }>();

    return rows.map((r) => ({
      day: r.day.toISOString().slice(0, 10),
      value: parseInt(r.value, 10),
    }));
  }
}
