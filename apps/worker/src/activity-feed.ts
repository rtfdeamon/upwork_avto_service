import './tracing';
import 'reflect-metadata';

import { AppDataSource } from './data-source';
import { ApiKey } from './entities/api-key.entity';
import { User, SubscriptionStatus } from './entities/user.entity';
import { Conversation } from './entities/conversation.entity';
import { Webhook } from './entities/webhook.entity';
import { fetchActivityFeed, ActivityMessage } from './lib/upwork';
import axios from 'axios';
import crypto from 'crypto';
import { log, error } from './logger';

let ready = false;

export const handler = async () => {
  if (!ready) {
    await AppDataSource.initialize();
    ready = true;
  }
  const apiKeys = await AppDataSource.getRepository(ApiKey).find({ relations: ['user'] });
  const convoRepo = AppDataSource.getRepository(Conversation);
  const hookRepo = AppDataSource.getRepository(Webhook);

  for (const key of apiKeys) {
    if (key.user.subscription !== SubscriptionStatus.ACTIVE) continue;
    let messages: ActivityMessage[] = [];
    try {
      messages = await fetchActivityFeed(key.upworkKey);
    } catch (e: any) {
      error(`failed to fetch feed for ${key.id}`, e.message);
      continue;
    }
    for (const msg of messages) {
      const exists = await convoRepo.findOne({ where: { id: msg.id } });
      if (!exists) {
        const convo = convoRepo.create({
          id: msg.id,
          user: key.user,
          jobId: msg.jobId,
          jobTitle: msg.jobTitle,
          snippet: msg.snippet,
          ts: new Date(msg.ts),
        });
        await convoRepo.save(convo);

        if (msg.author.toLowerCase() === 'client') {
          const payload = {
            jobId: msg.jobId,
            msgSnippet: msg.snippet,
          };
          const hooks = await hookRepo.find({
            where: { user: { id: key.user.id }, isActive: true },
          });
          for (const h of hooks) {
            const body = JSON.stringify(payload);
            const sig = crypto.createHmac('sha256', h.secret).update(body).digest('hex');
            try {
              await axios.post(h.url, payload, { headers: { 'x-signature': sig } });
              log(`webhook sent to ${h.id}`);
            } catch (err: any) {
              error('webhook send failed', err.message);
            }
          }
        }
      }
    }
  }
};

if (require.main === module) {
  handler()
    .then(() => log('done'))
    .catch((e) => error('fatal', e));
}
