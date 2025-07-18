/* tracing.ts пока необязателен; заглушка, чтобы не падать */
(async () => {
  try {
    await import('./tracing');
  } catch {
    /* noop */
  }
})();
import 'reflect-metadata';
import { AppDataSource } from './data-source';
/* ApiKey entity объявлен в API-приложении.
   В монорепо достаточно сослаться на исходный файл: */
import { ApiKey } from '../../api/src/entities/api-key.entity';
import { User, SubscriptionStatus } from './entities/user.entity';
import { searchJobs } from './lib/upwork';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import Redis from 'ioredis';
import { log, error } from './logger';

const dataSource = AppDataSource;

const sqs = new SQSClient({});
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const handler = async () => {
  if (!dataSource.isInitialized) await dataSource.initialize();
  const apiKeys = await dataSource
    .getRepository(ApiKey)
    .find({ relations: ['user'] });
  for (const key of apiKeys) {
    if (key.user.subscription !== SubscriptionStatus.ACTIVE) continue;
    try {
      const jobs = await searchJobs(key.upworkKey);
      for (const job of jobs) {
        const seenKey = `user:${key.user.id}:seen`;
        const seen = await redis.sismember(seenKey, job.id);
        if (seen) continue;
        await redis.sadd(seenKey, job.id);
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: process.env.JOBS_QUEUE_URL!,
            MessageGroupId: key.id,
            MessageDeduplicationId: job.id,
            MessageBody: JSON.stringify({ jobJson: job, apiKeyId: key.id }),
          }),
        );
      }
      log(`polled jobs for ${key.id}`);
    } catch (e: any) {
      error(`poller error for ${key.id}`, e.message);
    }
  }
};

// Allow running locally
if (require.main === module) {
  handler()
    .then(() => log('done'))
    .catch((e) => error('fatal', e));
}
