import { Module } from '@nestjs/common';
import { LoansController } from './loans.controller';
import { LoanApplicationsController } from './loan-applications.controller';
import { LoanProductsController } from './loan-products.controller';
import { LoanInstallmentsController } from './loan-installments.controller';
import { LoanPaymentsController } from './loan-payments.controller';
import { LoanProductsService } from './loan-products.service';
import { LoanApplicationsService } from './loan-applications.service';
import { LoansService } from './loans.service';
import { LoanInstallmentsService } from './loan-installments.service';
import { LoanPaymentsService } from './loan-payments.service';
import { LoanCalculationService } from './loan-calculator.service';
import { OverdueProcessorService } from './overdue-processor.service';
import { CreditModule } from '../credit/credit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [CreditModule, NotificationsModule],
  controllers: [
    LoanProductsController,
    LoanApplicationsController,
    LoansController,
    LoanInstallmentsController,
    LoanPaymentsController,
  ],
  providers: [
    LoanProductsService,
    LoanApplicationsService,
    LoansService,
    LoanInstallmentsService,
    LoanPaymentsService,
    LoanCalculationService,
    OverdueProcessorService,
    PrismaService,
  ],
  exports: [
    LoanProductsService,
    LoanApplicationsService,
    LoansService,
    LoanCalculationService,
    LoanInstallmentsService,
    LoanPaymentsService,
  ],
})
export class LendingModule {}

