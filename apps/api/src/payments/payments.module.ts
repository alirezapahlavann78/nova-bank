import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentAuditService } from './payments-audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { IdempotencyService } from '../common/idempotency.service';
import { RiskEngineService } from '../common/risk-engine.service';

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentAuditService, IdempotencyService, RiskEngineService, PrismaService],
  exports: [PaymentsService, PaymentAuditService],
})
export class PaymentsModule {}
