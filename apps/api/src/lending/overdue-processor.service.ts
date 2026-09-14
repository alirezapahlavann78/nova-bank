import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreditAuditService } from '../credit/credit-audit.service';
import { VALID_INSTALLMENT_TRANSITIONS } from './lending-state-machine';

@Injectable()
export class OverdueProcessorService {
  private readonly logger = new Logger(OverdueProcessorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly creditAuditService: CreditAuditService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'overdue-processor' })
  async processOverdue() {
    this.logger.log('Checking for overdue installments');
    const now = new Date();

    const dueInstallments = await this.prisma.loanInstallment.findMany({
      where: {
        status: { in: ['DUE', 'PARTIALLY_PAID', 'PENDING'] },
        dueDate: { lt: now },
        remainingAmount: { gt: 0 },
      },
      include: { loan: { select: { id: true, userId: true } } },
    });

    for (const installment of dueInstallments) {
      const currentStatus = installment.status;
      let newStatus: string;

      if (currentStatus === 'PENDING' || currentStatus === 'DUE') {
        newStatus = 'OVERDUE';
      } else if (currentStatus === 'PARTIALLY_PAID') {
        newStatus = 'OVERDUE';
      } else {
        continue;
      }

      if (!VALID_INSTALLMENT_TRANSITIONS[currentStatus].includes(newStatus)) {
        this.logger.warn(`Invalid transition: ${currentStatus} -> ${newStatus} for installment ${installment.id}`);
        continue;
      }

      await this.prisma.$transaction(async (tx: any) => {
        await tx.loanInstallment.update({
          where: { id: installment.id },
          data: { status: newStatus },
        });

        const loan = await tx.loan.findUnique({ where: { id: installment.loanId } });
        if (loan && loan.status === 'ACTIVE') {
          await tx.loan.update({ where: { id: loan.id }, data: { status: 'DEFAULTED' } });
        }

        await this.creditAuditService.logAction(installment.userId, 'INSTALLMENT_MARKED_OVERDUE', newStatus, {
          metadata: {
            installmentId: installment.id,
            loanId: installment.loanId,
            dueDate: installment.dueDate.toISOString(),
          },
          loanId: installment.loanId,
          installmentId: installment.id,
        });

        const preferences = await this.notificationsService.getPreferences(installment.userId);
        if (preferences.loanAlerts) {
          await this.notificationsService.createNotification(
            installment.userId,
            'LOAN_PAYMENT_OVERDUE',
            'قسط منقضی شده',
            `قسط ${installment.installmentNumber} وام شما منقضی شده است و باید پرداخت شود.`,
            { loanId: installment.loanId, installmentId: installment.id, amount: installment.remainingAmount },
          );
        }
      });
    }

    if (dueInstallments.length > 0) {
      this.logger.log(`Marked ${dueInstallments.length} installments as overdue`);
    }
  }
}
