import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private service: ApiKeysService) {}

  @Get(':userId')
  async list(@Param('userId') userId: string) {
    return this.service.findAll(userId);
  }

  @Post(':userId')
  async create(@Param('userId') userId: string, @Body() body: any) {
    return this.service.create(userId, body);
  }
}
