import { Module } from '@nestjs/common';
import { PaymentTemplatesController } from './payment-templates.controller';
import { PaymentTemplatesService } from './payment-templates.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [PaymentTemplatesController],
  providers: [PaymentTemplatesService, PrismaService],
  exports: [PaymentTemplatesService],
})
export class PaymentTemplatesModule {}
