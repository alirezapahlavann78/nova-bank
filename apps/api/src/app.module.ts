import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { BanksModule } from './banks/banks.module';
import { CardsModule } from './cards/cards.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TransfersModule } from './transfers/transfers.module';
import { RecurringTransactionsModule } from './recurring-transactions/recurring-transactions.module';
import { PaymentsModule } from './payments/payments.module';
import { BeneficiariesModule } from './beneficiaries/beneficiaries.module';
import { PaymentTemplatesModule } from './payment-templates/payment-templates.module';
import { ScheduledPaymentsModule } from './scheduled-payments/scheduled-payments.module';
import { PaymentExecutionsModule } from './payment-executions/payment-executions.module';
import { IdempotencyKeysModule } from './idempotency-keys/idempotency-keys.module';
import { CreditModule } from './credit/credit.module';
import { LendingModule } from './lending/lending.module';
import { BudgetsModule } from './budgets/budgets.module';
import { GoalsModule } from './goals/goals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NotificationPreferencesModule } from './notification-preferences/notification-preferences.module';
import { ReportsModule } from './reports/reports.module';
import { AIModule } from './ai/ai.module';
import { InvestmentsModule } from './investments/investments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    PrismaModule,
    CommonModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AccountsModule,
    BanksModule,
    CardsModule,
    CategoriesModule,
    TransactionsModule,
    TransfersModule,
    RecurringTransactionsModule,
    PaymentsModule,
    BeneficiariesModule,
    PaymentTemplatesModule,
    ScheduledPaymentsModule,
    PaymentExecutionsModule,
    IdempotencyKeysModule,
    CreditModule,
    LendingModule,
    BudgetsModule,
    GoalsModule,
    NotificationsModule,
    NotificationPreferencesModule,
    ReportsModule,
    AIModule,
    InvestmentsModule,
  ],
})
export class AppModule {}
