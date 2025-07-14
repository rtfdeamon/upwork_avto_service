import { execSync } from 'child_process';
import { SQSClient, CreateQueueCommand, SendMessageCommand, ReceiveMessageCommand, DeleteQueueCommand } from '@aws-sdk/client-sqs';
import { AppDataSource } from '../../apps/worker/src/data-source';
import { Proposal, ProposalStatus } from '../../apps/worker/src/entities/proposal.entity';
import { handler as draftHandler } from '../../apps/worker/src/draft-handler';

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('Starting localstack containers');
  execSync('docker-compose -f docker-compose-localstack.yml up -d', { stdio: 'inherit' });
  process.env.AWS_REGION = 'us-east-1';
  const endpoint = 'http://localhost:4566';
  const sqs = new SQSClient({ endpoint, region: 'us-east-1' });

  const jobsQ = await sqs.send(new CreateQueueCommand({ QueueName: 'jobs.fifo', Attributes: { FifoQueue: 'true', ContentBasedDeduplication: 'true' } }));
  const propsQ = await sqs.send(new CreateQueueCommand({ QueueName: 'props.fifo', Attributes: { FifoQueue: 'true', ContentBasedDeduplication: 'true' } }));
  const jobsUrl = jobsQ.QueueUrl!;
  const propsUrl = propsQ.QueueUrl!;

  process.env.JOBS_QUEUE_URL = jobsUrl;
  process.env.PROPOSALS_QUEUE_URL = propsUrl;
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5433';
  process.env.DB_USER = 'upwork';
  process.env.DB_PASS = 'upwork';
  process.env.DB_NAME = 'upwork';
  process.env.TYPEORM_SYNC = 'true';
  process.env.UPWORK_MOCK = 'true';

  // wait for db
  await delay(5000);
  await AppDataSource.initialize();

  // seed api key and user
  await AppDataSource.getRepository('user').query(`INSERT INTO "user"(id, email, role, "hashedPw", "createdAt", subscription) VALUES('u1','test@example.com','OWNER','x',now(),'ACTIVE')`);
  await AppDataSource.getRepository('api_key').query(`INSERT INTO api_key(id, "userId", "upworkKey", "upworkSecret", "createdAt") VALUES('k1','u1','tok','sec',now())`);

  for (let i = 0; i < 5; i++) {
    await sqs.send(new SendMessageCommand({
      QueueUrl: jobsUrl,
      MessageGroupId: 'k1',
      MessageDeduplicationId: 'job' + i,
      MessageBody: JSON.stringify({ jobJson: { id: 'job' + i, title: 'Job ' + i }, apiKeyId: 'k1' })
    }));
  }

  // fake SQS trigger loop
  const start = Date.now();
  while (Date.now() - start < 180000) {
    const msgs = await sqs.send(new ReceiveMessageCommand({ QueueUrl: jobsUrl, MaxNumberOfMessages: 5, WaitTimeSeconds: 1 }));
    if (msgs.Messages?.length) {
      await (draftHandler as any)({ Records: msgs.Messages.map(m => ({ body: m.Body! })) });
    }
    const count = await AppDataSource.getRepository(Proposal).countBy({ status: ProposalStatus.SENT });
    if (count >= 3) {
      console.log('PASS');
      break;
    }
  }

  const proposals = await AppDataSource.getRepository(Proposal).find();
  console.log('Proposals', proposals.length);

  await sqs.send(new DeleteQueueCommand({ QueueUrl: jobsUrl }));
  await sqs.send(new DeleteQueueCommand({ QueueUrl: propsUrl }));
  execSync('docker-compose -f docker-compose-localstack.yml down', { stdio: 'inherit' });

  const errors = proposals.filter(p => p.status === ProposalStatus.ERROR);
  if (proposals.filter(p => p.status === ProposalStatus.SENT).length < 3 || errors.length) {
    throw new Error('Smoke test failed');
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
