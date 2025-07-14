import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from '../entities/proposal.entity';
import { Conversation } from '../entities/conversation.entity';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal, Conversation])],
  providers: [MetricsService],
  controllers: [MetricsController],
})
export class MetricsModule {}
