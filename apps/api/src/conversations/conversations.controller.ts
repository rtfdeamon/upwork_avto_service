import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private service: ConversationsService) {}

  @Get()
  list(@Req() req: any, @Query('since') since = '7d') {
    const match = /^(\d+)d$/.exec(since);
    const days = match ? parseInt(match[1], 10) : 7;
    return this.service.since(req.user.id, days);
  }
}
