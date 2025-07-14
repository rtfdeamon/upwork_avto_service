import './tracing';
import { SQSHandler } from 'aws-lambda';
import { AppDataSource } from './data-source';
import { ApiKey } from './entities/api-key.entity';
import { Proposal, ProposalStatus } from './entities/proposal.entity';
import { SubscriptionStatus } from './entities/user.entity';
import { generateDraft } from './lib/openai';
import { log, error } from './logger';

let ready = false;

export const handler: SQSHandler = async (event) => {
  if (!ready) {
    await AppDataSource.initialize();
    ready = true;
  }
  const apiRepo = AppDataSource.getRepository(ApiKey);
  const propRepo = AppDataSource.getRepository(Proposal);

  for (const record of event.Records) {
    const payload = JSON.parse(record.body);
    const key = await apiRepo.findOne({
      where: { id: payload.apiKeyId },
      relations: ['user'],
    });
    if (!key) continue;
    if (key.user.subscription !== SubscriptionStatus.ACTIVE) continue;
    const draftText = await generateDraft('profile', payload.jobJson, []);
    const proposal = propRepo.create({
      user: key.user,
      apiKey: key,
      jobId: payload.jobJson.id,
      jobTitle: payload.jobJson.title,
      draft: draftText,
      status: ProposalStatus.DRAFT,
    });
    await propRepo.save(proposal);
  }
};

if (require.main === module) {
  (handler as any)({ Records: [] })
    .then(() => log('done'))
    .catch((e: any) => error('fatal', e));
}
