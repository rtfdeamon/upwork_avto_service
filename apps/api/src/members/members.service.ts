import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Member, MemberRole } from '../entities/member.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Member) private members: Repository<Member>,
  ) {}

  async invite(ownerId: string, email: string, role: MemberRole) {
    const owner = await this.users.findOneBy({ id: ownerId });
    if (!owner || owner.role !== UserRole.OWNER) {
      throw new ForbiddenException('not owner');
    }
    const member = this.members.create({ email, role, owner });
    return this.members.save(member);
  }

  async updateRole(userId: string, memberId: string, role: MemberRole) {
    const member = await this.members.findOne({ where: { id: memberId }, relations: ['owner'] });
    if (!member) throw new NotFoundException('member not found');
    if (member.owner.id !== userId) {
      throw new ForbiddenException('not owner');
    }
    member.role = role;
    return this.members.save(member);
  }
}
