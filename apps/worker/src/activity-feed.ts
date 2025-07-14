import './tracing';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import { User, SubscriptionStatus } from './entities/user.entity';
import { Conversation } from './entities/conversation.entity';
import { fetchActivityFeed, ActivityMessage } from './lib/upwork';
import axios from 'axios';
import crypto from 'crypto';
import { log, error } from './logger';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'upwork',
  password: process.env.DB_PASS || 'upwork',
  database: process.env.DB_NAME || 'upwork',
  entities: [ApiKey, User, Conversation],
});

export const handler = async () => {
  if (!dataSource.isInitialized) await dataSource.initialize();
  const apiKeys = await dataSource.getRepository(ApiKey).find({ relations: ['user'] });
  const convoRepo = dataSource.getRepository(Conversation);

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
          snippet: msg.snippet,
          ts: new Date(msg.ts),
        });
        await convoRepo.save(convo);

        if (msg.author.toLowerCase() === 'client') {
          const payload = {
            userId: key.user.id,
            jobId: msg.jobId,
            msgSnippet: msg.snippet,
          };
          const body = JSON.stringify(payload);
          const sig = crypto
            .createHmac('sha256', process.env.WEBHOOK_SECRET || '')
            .update(body)
            .digest('hex');
          try {
            await axios.post(process.env.WEBHOOK_DISPATCH_URL || '', payload, {
              headers: { 'x-signature': sig },
            });
            log(`webhook dispatched for convo ${msg.id}`);
          } catch (err: any) {
            error('webhook dispatch failed', err.message);
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
