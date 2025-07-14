import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import crypto from 'crypto';
import { WebhooksService } from './webhooks.service';
import { Webhook } from '../entities/webhook.entity';

@Controller('webhooks')
export class WebhooksController {
  constructor(private service: WebhooksService) {}

  @Get(':userId')
  list(@Param('userId') userId: string) {
    return this.service.list(userId);
  }

  @Post(':userId')
  create(@Param('userId') userId: string, @Body() body: Partial<Webhook>) {
    return this.service.create(userId, body);
  }

  @Post()
  async dispatch(
    @Body() body: { userId: string; jobId: string; msgSnippet: string },
    @Headers('x-signature') sig: string,
  ) {
    const calc = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET || '')
      .update(JSON.stringify(body))
      .digest('hex');
    if (sig !== calc) throw new UnauthorizedException('bad signature');
    await this.service.dispatch(body.userId, { jobId: body.jobId, msgSnippet: body.msgSnippet });
    return { status: 'ok' };
  }
}
