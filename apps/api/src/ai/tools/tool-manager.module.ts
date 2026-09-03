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
import { PrismaService } from '../../prisma/prisma.service';

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
  ],
  providers: [ToolManagerService, PrismaService],
  exports: [ToolManagerService],
})
export class ToolManagerModule {}
