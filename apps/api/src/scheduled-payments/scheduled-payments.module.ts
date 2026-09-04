import { Module } from '@nestjs/common';
import { ScheduledPaymentsController } from './scheduled-payments.controller';
import { ScheduledPaymentsService } from './scheduled-payments.service';
import { ScheduledPaymentRunner } from './scheduled-payment-runner.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ScheduledPaymentsController],
  providers: [ScheduledPaymentsService, ScheduledPaymentRunner, PrismaService],
  exports: [ScheduledPaymentsService],
})
export class ScheduledPaymentsModule {}
