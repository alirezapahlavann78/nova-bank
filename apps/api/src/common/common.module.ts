import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { IdempotencyService } from './idempotency.service';
import { RiskEngineService } from './risk-engine.service';

@Module({
  providers: [ConfigService, IdempotencyService, RiskEngineService],
  exports: [ConfigService, IdempotencyService, RiskEngineService],
})
export class CommonModule {}
