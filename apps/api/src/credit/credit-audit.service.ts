import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CreditAuditAction =
  | 'CREDIT_SCORE_CALCULATED'
  | 'ELIGIBILITY_EVALUATED'
  | 'LOAN_APPLICATION_CREATED'
  | 'LOAN_APPLICATION_SUBMITTED'
  | 'LOAN_APPLICATION_APPROVED'
  | 'LOAN_APPLICATION_REJECTED'
  | 'LOAN_CREATED'
  | 'LOAN_ACTIVATED'
  | 'INSTALLMENT_GENERATED'
  | 'INSTALLMENT_MARKED_OVERDUE'
  | 'LOAN_PAYMENT_CREATED'
  | 'LOAN_PAYMENT_COMPLETED'
  | 'LOAN_PAYMENT_FAILED'
  | 'LOAN_COMPLETED'
  | 'LOAN_DEFAULTED';

@Injectable()
export class CreditAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(userId: string, action: CreditAuditAction, status: string, options?: {
    requestId?: string;
    failureReason?: string;
    metadata?: Record<string, any>;
    loanId?: string;
    loanApplicationId?: string;
    installmentId?: string;
    creditProfileId?: string;
    scoreHistoryId?: string;
    paymentId?: string;
  }) {
    return this.prisma.creditAudit.create({
      data: {
        userId,
        action,
        status,
        requestId: options?.requestId,
        failureReason: options?.failureReason,
        metadata: options?.metadata,
        loanId: options?.loanId,
        loanApplicationId: options?.loanApplicationId,
        installmentId: options?.installmentId,
        creditProfileId: options?.creditProfileId,
        scoreHistoryId: options?.scoreHistoryId,
        paymentId: options?.paymentId,
      },
    });
  }

  async getAuditTrail(userId: string, filters?: { loanId?: string; loanApplicationId?: string; action?: string; limit?: number }) {
    const where: any = { userId };
    if (filters?.loanId) where.loanId = filters.loanId;
    if (filters?.loanApplicationId) where.loanApplicationId = filters.loanApplicationId;
    if (filters?.action) where.action = filters.action;

    return this.prisma.creditAudit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit ?? 100,
    });
  }
}
