import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from '../entities/proposal.entity';
import { ProposalsService } from './proposals.service';
import { ProposalsController } from './proposals.controller';
import { UpworkModule } from '../upwork/upwork.module';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal]), UpworkModule],
  providers: [ProposalsService],
  controllers: [ProposalsController],
})
export class ProposalsModule {}
