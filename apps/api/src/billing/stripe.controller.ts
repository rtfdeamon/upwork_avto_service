import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import Stripe from 'stripe';
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, SubscriptionStatus } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2022-11-15',
  });

  constructor(@InjectRepository(User) private users: Repository<User>) {}

  @Post('checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckout(@Req() req: any) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        { price: process.env.PRICE_ID || 'MONTHLY_49', quantity: 1 },
      ],
      success_url: `${req.headers.origin}/dashboard/overview`,
      cancel_url: `${req.headers.origin}/dashboard/overview`,
      customer_email: req.user.email,
      subscription_data: { metadata: { userId: req.user.id } },
    });
    return { url: session.url };
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        (req as any).rawBody,
        req.headers['stripe-signature'] as string,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (err) {
      res.status(400).send(`Webhook Error: ${(err as any).message}`);
      return;
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = (invoice.metadata as any)?.userId;
      if (userId) {
        await this.users.update(
          { id: userId },
          { subscription: SubscriptionStatus.PAST_DUE },
        );
      }
    } else if (
      event.type === 'invoice.payment_succeeded' ||
      event.type === 'invoice.paid'
    ) {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = (invoice.metadata as any)?.userId;
      if (userId) {
        await this.users.update(
          { id: userId },
          { subscription: SubscriptionStatus.ACTIVE },
        );
      }
    }

    res.json({ received: true });
  }
}
