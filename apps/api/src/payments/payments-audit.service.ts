import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(paymentId: string, userId: string, action: string, status: string, options?: {
    requestId?: string;
    failureReason?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.paymentAudit.create({
      data: {
        paymentId,
        userId,
        action,
        status,
        requestId: options?.requestId,
        failureReason: options?.failureReason,
        metadata: options?.metadata,
      },
    });
  }

  async getAuditTrail(paymentId: string, userId: string) {
    return this.prisma.paymentAudit.findMany({
      where: { paymentId, userId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
