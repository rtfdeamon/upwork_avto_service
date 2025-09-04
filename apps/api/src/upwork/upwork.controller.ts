import { Controller, Get, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpworkService } from './upwork.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';

@Controller('upwork')
@UseGuards(JwtAuthGuard)
export class UpworkController {
  constructor(
    private upwork: UpworkService,
    @InjectRepository(ApiKey) private keys: Repository<ApiKey>,
  ) {}

  @Get('jobs')
  async jobs(
    @Req() req: Request,
    @Query('query') query?: string,
    @Query('alias') alias?: string,
  ) {
    const userId = (req as any).user.id;
    const where: any = { user: { id: userId } };
    if (alias) where.alias = alias;
    const key = await this.keys.findOne({ where, order: { createdAt: 'DESC' } });
    if (!key) throw new BadRequestException('No API key configured');
    return this.upwork.searchJobs(key, query);
  }
}

