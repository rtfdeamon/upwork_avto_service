import { Body, Controller, Patch, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MembersService } from './members.service';
import { MemberRole } from '../entities/member.entity';

@Controller('members')
export class MembersController {
  constructor(private service: MembersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  invite(@Req() req: any, @Body() body: { email: string; role: MemberRole }) {
    const userId = req.user.sub;
    return this.service.invite(userId, body.email, body.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateRole(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { role: MemberRole },
  ) {
    const userId = req.user.sub;
    return this.service.updateRole(userId, id, body.role);
  }
}
