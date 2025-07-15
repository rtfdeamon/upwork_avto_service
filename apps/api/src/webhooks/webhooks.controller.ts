
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WebhooksService } from './webhooks.service';
import { Webhook } from '../entities/webhook.entity';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private service: WebhooksService) {}

  @Get()
  list(@Req() req: Request) {
    return this.service.list((req as any).user.id);
  }

  @Post()
  create(@Req() req: Request, @Body() body: Partial<Webhook>) {
    return this.service.create((req as any).user.id, body);
  }

  @Post(':id/test')
  async test(@Req() req: Request, @Param('id') id: string) {
    await this.service.test((req as any).user.id, id);
    return { status: 'sent' };
  }
}
