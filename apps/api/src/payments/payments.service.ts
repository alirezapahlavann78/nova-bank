import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentAuditService } from './payments-audit.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { IdempotencyService } from '../common/idempotency.service';
import { RiskEngineService, RiskAction } from '../common/risk-engine.service';
import { randomUUID } from 'crypto';

export const VALID_PAYMENT_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['PENDING', 'FAILED', 'CANCELLED'],
  PENDING: ['PROCESSING', 'FAILED', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'FAILED', 'CANCELLED'],
  COMPLETED: ['REVERSED', 'CANCELLED'],
  FAILED: ['PENDING'],
  CANCELLED: [],
  REVERSED: [],
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly paymentAuditService: PaymentAuditService,
    private readonly idempotencyService: IdempotencyService,
    private readonly riskEngineService: RiskEngineService,
  ) {}

  async findAll(userId: string, query?: { type?: string; status?: string; fromDate?: string; toDate?: string; limit?: number }) {
    const where: any = { userId };
    if (query?.type) where.type = query.type;
    if (query?.status) where.status = query.status;
    if (query?.fromDate || query?.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query?.limit ? Math.min(query.limit, 100) : undefined,
    });
  }

  async findOne(id: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id, userId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async getAuditTrail(id: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id, userId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return this.paymentAuditService.getAuditTrail(id, userId);
  }

  async create(userId: string, dto: CreatePaymentDto, idempotencyKey?: string, requestId?: string) {
    if (idempotencyKey) {
      const idempotent = await this.idempotencyService.checkAndReserveWithHash(
        idempotencyKey, userId, 'PAYMENT', this.hashRequest(dto),
      );
      if (idempotent.status === 'COMPLETED') {
        return idempotent.response;
      }
    }    const source = await this.prisma.account.findFirst({ where: { id: dto.sourceAccountId, userId } });
    if (!source) throw new NotFoundException('Source account not found');
    if (!source.isActive) throw new ForbiddenException('Cannot pay from inactive account');

    const totalAmount = dto.amount + (dto.fees || 0);
    if (source.balance < totalAmount) throw new BadRequestException('Insufficient balance');

    const risk = this.riskEngineService.evaluate(userId, dto.amount, dto.currency || 'IRT', dto.destinationType);
    if (risk.action === RiskAction.BLOCK) {
      await this.idempotencyService.markFailed(idempotencyKey, userId);
      throw new BadRequestException('Payment blocked by risk engine');
    }
    if (risk.action === RiskAction.REVIEW) {
      await this.idempotencyService.markFailed(idempotencyKey, userId);
      throw new BadRequestException(`Payment requires review: ${risk.reason}`);
    }

    const riskLevel = risk.action === RiskAction.MEDIUM ? 'MEDIUM' : 'LOW';
    const internalReference = `PAY-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

    return this.prisma.$transaction(async (tx: any) => {
      const payment = await tx.payment.create({
        data: {
          userId,
          type: dto.type as any,
          amount: dto.amount,
          currency: dto.currency as any,
          sourceAccountId: dto.sourceAccountId,
          destinationType: dto.destinationType as any,
          destinationValue: dto.destinationValue,
          destinationName: dto.destinationName,
          description: dto.description,
          fees: dto.fees,
          internalReference,
          riskLevel,
          status: 'COMPLETED',
          executedAt: new Date(),
          completedAt: new Date(),
        },
      });

      await tx.account.update({ where: { id: dto.sourceAccountId }, data: { balance: { decrement: totalAmount } } });

      await tx.paymentExecution.create({
        data: {
          userId,
          paymentId: payment.id,
          status: 'SUCCESS',
          attemptNumber: 1,
          processedAt: new Date(),
        },
      });

      await tx.paymentAudit.create({
        data: {
          paymentId: payment.id,
          userId,
          action: 'CREATE',
          status: 'COMPLETED',
          requestId,
          metadata: { amount: dto.amount, currency: dto.currency, type: dto.type, fees: dto.fees || 0 },
        },
      });

      const preferences = await this.notificationsService.getPreferences(userId);
      if (preferences.paymentAlerts) {
        await this.notificationsService.createNotification(
          userId,
          'PAYMENT_COMPLETED',
          'پرداخت انجام شد',
          `پرداخت ${dto.amount} ${dto.currency} با موفقیت انجام شد.`,
          { paymentId: payment.id },
        );
      }

      if (idempotencyKey) {
        await this.idempotencyService.markCompleted(idempotencyKey, userId, payment);
      }

      return payment;
    });
  }

  async cancel(id: string, userId: string, requestId?: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id, userId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (!this.isValidTransition(payment.status, 'REVERSED')) {
      throw new BadRequestException(`Cannot transition from ${payment.status} to REVERSED`);
    }

    return this.prisma.$transaction(async (tx: any) => {
      const updated = await tx.payment.update({
        where: { id },
        data: { status: 'REVERSED', updatedAt: new Date() },
      });

      await tx.account.update({
        where: { id: payment.sourceAccountId },
        data: { balance: { increment: payment.amount + payment.fees } },
      });

      await tx.paymentExecution.create({
        data: {
          userId,
          paymentId: payment.id,
          status: 'SUCCESS',
          attemptNumber: 1,
          processedAt: new Date(),
        },
      });

      await tx.paymentAudit.create({
        data: {
          paymentId: payment.id,
          userId,
          action: 'CANCEL',
          status: 'REVERSED',
          requestId,
          metadata: { amount: payment.amount, fees: payment.fees },
        },
      });

      return updated;
    });
  }

  private isValidTransition(currentStatus: string, targetStatus: string): boolean {
    const allowed = VALID_PAYMENT_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(targetStatus) : false;
  }

  private hashRequest(dto: CreatePaymentDto): string {
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(JSON.stringify({ type: dto.type, amount: dto.amount, currency: dto.currency, sourceAccountId: dto.sourceAccountId, destinationType: dto.destinationType, destinationValue: dto.destinationValue, destinationName: dto.destinationName, description: dto.description, fees: dto.fees }))
      .digest('hex');
  }
}
