import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { UpworkAuthModule } from './upwork-auth/upwork-auth.module';
import { User } from './entities/user.entity';
import { ApiKey } from './entities/api-key.entity';
import { RuleSet } from './entities/rule-set.entity';
import { RulesetsModule } from './rulesets/rulesets.module';
import { MeController } from './controllers/me.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'upwork',
      password: process.env.DB_PASS || 'upwork',
      database: process.env.DB_NAME || 'upwork',
      entities: [User, ApiKey, RuleSet],
      synchronize: false,
    }),
    AuthModule,
    ApiKeysModule,
    RulesetsModule,
    ScheduleModule.forRoot(),
    UpworkAuthModule,
  ],
  controllers: [MeController],
})
export class AppModule {}
