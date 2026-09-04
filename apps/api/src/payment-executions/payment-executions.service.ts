import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentExecutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPayment(paymentId: string, userId: string) {
    return this.prisma.paymentExecution.findMany({
      where: { paymentId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByScheduled(scheduledPaymentId: string, userId: string) {
    return this.prisma.paymentExecution.findMany({
      where: { scheduledPaymentId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
