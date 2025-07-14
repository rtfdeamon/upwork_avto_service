import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RulesetsService } from './rulesets.service';
import { RulesetsController } from './rulesets.controller';
import { RuleSet } from '../entities/rule-set.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RuleSet, User])],
  providers: [RulesetsService],
  controllers: [RulesetsController],
})
export class RulesetsModule {}
