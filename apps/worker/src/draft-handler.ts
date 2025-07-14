import './tracing';
import { SQSHandler } from 'aws-lambda';
import { AppDataSource } from './data-source';
import { ApiKey } from './entities/api-key.entity';
import { Proposal, ProposalStatus } from './entities/proposal.entity';
import { SubscriptionStatus } from './entities/user.entity';
import { generateDraft } from './lib/openai';
import { submitProposal } from './lib/upwork';
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
      jobId: payload.jobJson.id,
      draft: draftText,
      status: ProposalStatus.DRAFT,
    });
    await propRepo.save(proposal);

    const posted = new Date(payload.jobJson.postedAt || Date.now());
    const latencyMin = (Date.now() - posted.getTime()) / 60000;
    let connects = payload.connectsBudget || 2;
    if (latencyMin > 10) connects += 2;

    try {
      await submitProposal(key.upworkKey, payload.jobJson.id, draftText, connects);
      proposal.status = ProposalStatus.SENT;
      proposal.sentAt = new Date();
      proposal.connectsUsed = connects;
      log(`sent proposal for ${payload.jobJson.id}`);
    } catch (e: any) {
      proposal.status = ProposalStatus.ERROR;
      proposal.errorReason = e.message;
      error(`submit failed for ${payload.jobJson.id}`, e.message);
    }
    await propRepo.save(proposal);
  }
};

if (require.main === module) {
  (handler as any)({ Records: [] })
    .then(() => log('done'))
    .catch((e: any) => error('fatal', e));
}
