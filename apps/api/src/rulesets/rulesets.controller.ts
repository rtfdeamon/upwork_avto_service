import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { RulesetsService } from './rulesets.service';
import { RuleSet } from '../entities/rule-set.entity';
import { validate } from '../utils/jsonlogic-validator';

@Controller('rulesets')
export class RulesetsController {
  constructor(private service: RulesetsService) {}

  @Get(':userId')
  list(@Param('userId') userId: string) {
    return this.service.list(userId);
  }

  @Post(':userId')
  async create(@Param('userId') userId: string, @Body() body: Partial<RuleSet>) {
    validate(body.jsonLogic);
    return this.service.create(userId, body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: Partial<RuleSet>) {
    if (body.jsonLogic) validate(body.jsonLogic);
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
