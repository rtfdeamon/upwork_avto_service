import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from '../entities/webhook.entity';
import { User } from '../entities/user.entity';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook, User])],
  providers: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
