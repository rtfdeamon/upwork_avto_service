import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from '../entities/proposal.entity';
import { Conversation } from '../entities/conversation.entity';
import { Metric } from '../entities/metric.entity';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsCron } from './cron.metrics';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal, Conversation, Metric])],
  providers: [MetricsService, MetricsCron],
  controllers: [MetricsController],
})
export class MetricsModule {}
