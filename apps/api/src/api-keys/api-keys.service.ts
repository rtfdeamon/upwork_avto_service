import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private keys: Repository<ApiKey>,
    @InjectRepository(User)
    private users: Repository<User>,
  ) {}

  async findAll(userId: string) {
    return this.keys.find({ where: { user: { id: userId } } });
  }

  async create(userId: string, data: Partial<ApiKey>) {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) return null;
    const key = this.keys.create({ ...data, user });
    return this.keys.save(key);
  }
}
