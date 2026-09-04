import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ScheduledPaymentRunner {
  private readonly logger = new Logger(ScheduledPaymentRunner.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'scheduled-payment-runner' })
  async handleCron() {
    this.logger.log('Running scheduled payment check');
    const now = new Date();
    const due = await this.prisma.scheduledPayment.findMany({
      where: { status: 'ACTIVE', nextRunAt: { lte: now } },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    for (const scheduled of due) {
      try {
        await this.prisma.$transaction(async (tx: any) => {
          const source = await tx.account.findFirst({ where: { id: scheduled.sourceAccountId, userId: scheduled.userId } });
          if (!source || !source.isActive) {
            await tx.scheduledPayment.update({ where: { id: scheduled.id }, data: { status: 'FAILED' } });
            return;
          }

          const totalAmount = scheduled.amount;
          if (source.balance < totalAmount) {
            await tx.scheduledPayment.update({ where: { id: scheduled.id }, data: { status: 'FAILED' } });
            return;
          }

          const internalReference = `SPAY-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

          const payment = await tx.payment.create({
            data: {
              userId: scheduled.userId,
              type: scheduled.type,
              amount: scheduled.amount,
              currency: scheduled.currency,
              sourceAccountId: scheduled.sourceAccountId,
              destinationType: scheduled.destinationType,
              destinationValue: scheduled.destinationValue,
              description: scheduled.description,
              fees: 0,
              internalReference,
              status: 'COMPLETED',
              executedAt: now,
              completedAt: now,
            },
          });

          await tx.account.update({ where: { id: scheduled.sourceAccountId }, data: { balance: { decrement: totalAmount } } });

          await tx.paymentExecution.create({
            data: {
              userId: scheduled.userId,
              paymentId: payment.id,
              scheduledPaymentId: scheduled.id,
              status: 'SUCCESS',
              attemptNumber: 1,
              processedAt: now,
            },
          });

          await tx.paymentAudit.create({
            data: {
              paymentId: payment.id,
              userId: scheduled.userId,
              action: 'SCHEDULED_EXECUTION',
              status: 'COMPLETED',
              requestId: randomUUID(),
              metadata: {
                scheduledPaymentId: scheduled.id,
                frequency: scheduled.frequency,
                runCount: scheduled.runCount + 1,
              },
            },
          });

          const nextRunAt = this.calculateNextRun(scheduled.frequency, scheduled.nextRunAt);
          const runCount = scheduled.runCount + 1;
          const shouldStop = scheduled.maxRuns ? runCount >= scheduled.maxRuns : false;
          const shouldStopByEndDate = scheduled.endDate ? nextRunAt > scheduled.endDate : false;

          if (shouldStop || shouldStopByEndDate) {
            await tx.scheduledPayment.update({ where: { id: scheduled.id }, data: { status: 'COMPLETED', nextRunAt, runCount } });
          } else {
            await tx.scheduledPayment.update({ where: { id: scheduled.id }, data: { nextRunAt, runCount, lastRunAt: now } });
          }

          const preferences = await this.notificationsService.getPreferences(scheduled.userId);
          if (preferences?.paymentAlerts) {
            await this.notificationsService.createNotification(
              scheduled.userId,
              'PAYMENT_COMPLETED',
              'پرداخت برنامه‌ریزی شده',
              `پرداخت برنامه‌ریزی شده ${scheduled.amount} ${scheduled.currency} با موفقیت انجام شد.`,
              { paymentId: payment.id, scheduledPaymentId: scheduled.id },
            );
          }
        });
      } catch (error) {
        this.logger.error(`Failed to execute scheduled payment ${scheduled.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  private calculateNextRun(frequency: string, current: Date): Date {
    const next = new Date(current);
    switch (frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    return next;
  }
}
