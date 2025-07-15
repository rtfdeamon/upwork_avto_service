
import { Body, Controller, Param, Post, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { Get, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProposalsService } from './proposals.service';
import { ProposalFeedback } from '../entities/proposal.entity';
import { UpworkService } from '../upwork/upwork.service';

@Controller('proposals')
export class ProposalsController {
  constructor(
    private service: ProposalsService,
    private upworkService: UpworkService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Query('status') status: string, @Req() req) {
    return this.service.listForUser(req.user.id, status as any);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/feedback')
  setFeedback(
    @Param('id') id: string,
    @Body() body: { thumb: ProposalFeedback },
  ) {
    return this.service.setFeedback(id, body.thumb);
  }

  @Post(':id/send')
  @UseGuards(JwtAuthGuard)
  async send(@Param('id') id: string, @Req() req) {
    const prop = await this.service.findOwned(id, req.user.id);
    if (!prop) throw new BadRequestException('Not found');
    if (prop.status !== 'DRAFT')
      throw new BadRequestException('Already sent');
    await this.upworkService.createProposal(
      prop.apiKey!,
      prop.jobId,
      prop.draft,
    );
    await this.service.markSent(id);
    return { ok: true };
  }
}
