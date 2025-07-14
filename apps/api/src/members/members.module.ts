import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { Member } from '../entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, User])],
  providers: [MembersService],
  controllers: [MembersController],
})
export class MembersModule {}
