import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class MembersService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async invite(ownerId: string, email: string, role: UserRole) {
    const owner = await this.users.findOneBy({ id: ownerId });
    if (!owner || owner.role !== UserRole.OWNER) {
      throw new ForbiddenException('not owner');
    }
    const hashedPw = await bcrypt.hash('change-me', 10);
    const user = this.users.create({ email, role, hashedPw });
    await this.users.save(user);
    return { id: user.id, email: user.email, role: user.role };
  }
}
