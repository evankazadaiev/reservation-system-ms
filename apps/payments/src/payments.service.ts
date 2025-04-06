import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { CreateChargeDto } from '@app/common/dto/create-charge.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') as string,
      {
        apiVersion: '2025-02-24.acacia',
      },
    );
  }

  async createCharge({ token, amount }: CreateChargeDto) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        card: { token },
        type: 'card',
      });

      const paymentIntent = await this.stripe.paymentIntents.create({
        payment_method: paymentMethod.id,
        amount: amount * 100,
        confirm: true,
        payment_method_types: ['card'],
        currency: 'usd',
      });

      return paymentIntent;
    } catch (error) {
      console.log('Error while creating charge:', error);
    }
  }
}
