import { Module } from '@nestjs/common';
import { ToolManagerService } from './tool-manager.service';
import { AccountsModule } from '../../accounts/accounts.module';
import { TransactionsModule } from '../../transactions/transactions.module';
import { BudgetsModule } from '../../budgets/budgets.module';
import { GoalsModule } from '../../goals/goals.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { ReportsModule } from '../../reports/reports.module';
import { TransfersModule } from '../../transfers/transfers.module';
import { InvestmentsModule } from '../../investments/investments.module';
import { CreditModule } from '../../credit/credit.module';
import { LendingModule } from '../../lending/lending.module';
import { PaymentsModule } from '../../payments/payments.module';
import { BeneficiariesModule } from '../../beneficiaries/beneficiaries.module';
import { PaymentTemplatesModule } from '../../payment-templates/payment-templates.module';
import { ScheduledPaymentsModule } from '../../scheduled-payments/scheduled-payments.module';

@Module({
  imports: [
    AccountsModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    NotificationsModule,
    ReportsModule,
    TransfersModule,
    InvestmentsModule,
    CreditModule,
    LendingModule,
    PaymentsModule,
    BeneficiariesModule,
    PaymentTemplatesModule,
    ScheduledPaymentsModule,
  ],
  providers: [ToolManagerService],
  exports: [ToolManagerService],
})
export class ToolManagerModule {}
