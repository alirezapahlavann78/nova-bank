import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentExecutionsService } from './payment-executions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment-executions')
@UseGuards(JwtAuthGuard)
export class PaymentExecutionsController {
  constructor(private readonly paymentExecutionsService: PaymentExecutionsService) {}

  @Get('payment/:paymentId') async findByPayment(@Request() req: any, @Param('paymentId') paymentId: string) {
    return this.paymentExecutionsService.findByPayment(paymentId, req.user.id);
  }

  @Get('scheduled/:scheduledPaymentId') async findByScheduled(@Request() req: any, @Param('scheduledPaymentId') scheduledPaymentId: string) {
    return this.paymentExecutionsService.findByScheduled(scheduledPaymentId, req.user.id);
  }
}
