import './tracing';
import { SQSHandler } from 'aws-lambda';
import { AppDataSource } from './data-source';
import { ApiKey } from './entities/api-key.entity';
import { RuleSet } from './entities/rule-set.entity';
import { SubscriptionStatus } from './entities/user.entity';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import Redis from 'ioredis';
import jsonLogic from 'json-logic-js';
import { log, error } from './logger';

const sqs = new SQSClient({});
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
let ready = false;

export const handler: SQSHandler = async (event) => {
  if (!ready) {
    await AppDataSource.initialize();
    ready = true;
  }
  const apiRepo = AppDataSource.getRepository(ApiKey);
  const ruleRepo = AppDataSource.getRepository(RuleSet);

  for (const record of event.Records) {
    const payload = JSON.parse(record.body);
    const key = await apiRepo.findOne({
      where: { id: payload.apiKeyId },
      relations: ['user'],
    });
    if (!key) continue;
    if (key.user.subscription !== SubscriptionStatus.ACTIVE) continue;
    const processedKey = `user:${key.user.id}:processed`;
    const already = await redis.sismember(processedKey, payload.jobJson.id);
    if (already) continue;

    const rules = await ruleRepo.find({ where: { user: { id: key.user.id } } });
    let passed = rules.length === 0;
    for (const r of rules) {
      try {
        if (jsonLogic.apply(JSON.parse(r.jsonLogic), payload.jobJson)) {
          passed = true;
          break;
        }
      } catch {
        // ignore malformed rule
      }
    }
    if (!passed) {
      await redis.sadd(processedKey, payload.jobJson.id);
      continue;
    }

    try {
      await sqs.send(
        new SendMessageCommand({
          QueueUrl: process.env.PROPOSALS_QUEUE_URL!,
          MessageGroupId: key.id,
          MessageDeduplicationId: payload.jobJson.id,
          MessageBody: JSON.stringify(payload),
        }),
      );
      log(`queued job ${payload.jobJson.id}`);
    } catch (e: any) {
      error('queue send failed', e.message);
    }

  }
};
