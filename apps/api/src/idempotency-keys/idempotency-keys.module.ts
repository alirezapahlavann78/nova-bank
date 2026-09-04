import { Module } from '@nestjs/common';
import { IdempotencyKeysController } from './idempotency-keys.controller';
import { IdempotencyKeysService } from './idempotency-keys.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [IdempotencyKeysController],
  providers: [IdempotencyKeysService, PrismaService],
  exports: [IdempotencyKeysService],
})
export class IdempotencyKeysModule {}
