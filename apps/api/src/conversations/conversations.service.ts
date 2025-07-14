import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation) private repo: Repository<Conversation>,
  ) {}

  async since(userId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.repo.find({
      where: { user: { id: userId }, ts: MoreThanOrEqual(since) },
      order: { ts: 'DESC' },
    });
  }
}
