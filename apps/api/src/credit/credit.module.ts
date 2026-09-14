import { Module } from '@nestjs/common';
import { CreditController } from './credit.controller';
import { CreditProfileService } from './credit-profile.service';
import { CreditEngineService } from './credit-engine.service';
import { CreditScoreService } from './credit-score.service';
import { EligibilityEngineService } from './credit-eligibility.service';
import { CreditAuditService } from './credit-audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [CreditController],
  providers: [
    CreditProfileService,
    CreditEngineService,
    CreditScoreService,
    EligibilityEngineService,
    CreditAuditService,
    PrismaService,
  ],
  exports: [
    CreditProfileService,
    CreditEngineService,
    CreditScoreService,
    EligibilityEngineService,
    CreditAuditService,
  ],
})
export class CreditModule {}
