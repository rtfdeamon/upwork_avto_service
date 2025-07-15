import { Controller, Get, Query } from '@nestjs/common';
import { UpworkAuthService } from './upwork-auth.service';

@Controller('oauth/upwork')
export class UpworkAuthController {
  constructor(private service: UpworkAuthService) {}

  @Get('callback')
  async callback(@Query('code') code: string) {
    return this.service.exchangeCode(code);
  }
}
