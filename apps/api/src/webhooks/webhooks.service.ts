import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import crypto from 'crypto';
import { Webhook } from '../entities/webhook.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook) private hooks: Repository<Webhook>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  list(userId: string) {
    return this.hooks.find({ where: { user: { id: userId } } });
  }

  async create(userId: string, data: Partial<Webhook>) {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) return null;
    const hook = this.hooks.create({ ...data, user });
    return this.hooks.save(hook);
  }

  async dispatch(userId: string, payload: any) {
    const hooks = await this.hooks.find({ where: { user: { id: userId }, isActive: true } });
    for (const h of hooks) {
      const body = JSON.stringify(payload);
      const sig = crypto.createHmac('sha256', h.secret).update(body).digest('hex');
      try {
        await axios.post(h.url, payload, { headers: { 'x-signature': sig } });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('webhook send failed', err);
      }
    }
  }
}
