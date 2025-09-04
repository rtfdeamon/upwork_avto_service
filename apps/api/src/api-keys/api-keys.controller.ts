import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private service: ApiKeysService) {}

  // New: current user endpoints
  @Get()
  @UseGuards(JwtAuthGuard)
  async listMine(@Req() req: Request) {
    return this.service.findAll((req as any).user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createMine(@Req() req: Request, @Body() body: any) {
    return this.service.create((req as any).user.id, body);
  }

  @Get(':userId')
  async list(@Param('userId') userId: string) {
    return this.service.findAll(userId);
  }

  @Post(':userId')
  async create(@Param('userId') userId: string, @Body() body: any) {
    return this.service.create(userId, body);
  }
}
