import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProposalsService } from './proposals.service';
import { ProposalFeedback } from '../entities/proposal.entity';

@Controller('proposals')
export class ProposalsController {
  constructor(private service: ProposalsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/feedback')
  setFeedback(
    @Param('id') id: string,
    @Body() body: { thumb: ProposalFeedback },
  ) {
    return this.service.setFeedback(id, body.thumb);
  }
}
