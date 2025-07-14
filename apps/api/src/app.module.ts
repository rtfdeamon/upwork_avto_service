import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { UpworkAuthModule } from './upwork-auth/upwork-auth.module';
import { User } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { RuleSet } from './entities/rule-set.entity';
import { Proposal } from './entities/proposal.entity';
import { Conversation } from './entities/conversation.entity';
import { Webhook } from './entities/webhook.entity';
import { RulesetsModule } from './rulesets/rulesets.module';
import { MeController } from './controllers/me.controller';
import { MetricsModule } from './metrics/metrics.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { MembersModule } from './members/members.module';
import { BillingModule } from './billing/billing.module';
import { TenantMiddleware } from './tenant/tenant.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'upwork',
      password: process.env.DB_PASS || 'upwork',
      database: process.env.DB_NAME || 'upwork',
      entities: [User, ApiKey, RuleSet, Proposal, Conversation, Webhook],
      entities: [User, ApiKey, RuleSet],
      synchronize: false,
    }),
    AuthModule,
    ApiKeysModule,
    RulesetsModule,
    MetricsModule,
    ScheduleModule.forRoot(),
    UpworkAuthModule,
    WebhooksModule,
    MembersModule,
    BillingModule,
  ],
  controllers: [MeController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}