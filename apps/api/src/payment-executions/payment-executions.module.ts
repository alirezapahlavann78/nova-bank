import { Module } from '@nestjs/common';
import { PaymentExecutionsController } from './payment-executions.controller';
import { PaymentExecutionsService } from './payment-executions.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [PaymentExecutionsController],
  providers: [PaymentExecutionsService, PrismaService],
  exports: [PaymentExecutionsService],
})
export class PaymentExecutionsModule {}
