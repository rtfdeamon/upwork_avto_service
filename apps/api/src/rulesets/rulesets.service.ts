import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RuleSet } from '../entities/rule-set.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class RulesetsService {
  constructor(
    @InjectRepository(RuleSet) private rules: Repository<RuleSet>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  async list(userId: string) {
    return this.rules.find({ where: { user: { id: userId } } });
  }

  async create(userId: string, data: Partial<RuleSet>) {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) return null;
    const rule = this.rules.create({ ...data, user });
    return this.rules.save(rule);
  }

  async update(id: string, data: Partial<RuleSet>) {
    await this.rules.update(id, data);
    return this.rules.findOneBy({ id });
  }

  async remove(id: string) {
    await this.rules.delete(id);
    return { id };
  }
}
