import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MembersService } from './members.service';
import { UserRole } from '../entities/user.entity';

@Controller('members')
export class MembersController {
  constructor(private service: MembersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  invite(@Req() req: any, @Body() body: { email: string; role: UserRole }) {
    const userId = req.user.sub;
    return this.service.invite(userId, body.email, body.role);
  }
}
