import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MetricsService } from './metrics.service';

@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private service: MetricsService) {}

  @Get('summary')
  summary(@Req() req: any, @Query('range') range = '30d') {
    const match = /^(\d+)d$/.exec(range);
    const days = match ? parseInt(match[1], 10) : 30;
    return this.service.summary(req.user.id, days);
  }

  @Get('series')
  series(
    @Req() req: any,
    @Query('kind') kind: string,
    @Query('range') range = '30d',
  ) {
    const match = /^(\d+)d$/.exec(range);
    const days = match ? parseInt(match[1], 10) : 30;
    if (!['sent', 'replies', 'wins'].includes(kind)) {
      return [];
    }
    return this.service.series(req.user.id, days, kind as any);
  }
}
