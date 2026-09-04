import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { IdempotencyKeysService } from './idempotency-keys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('idempotency-keys')
@UseGuards(JwtAuthGuard)
export class IdempotencyKeysController {
  constructor(private readonly idempotencyKeysService: IdempotencyKeysService) {}

  @Get(':key') async findOne(@Request() req: any, @Param('key') key: string) {
    return this.idempotencyKeysService.findOne(key, req.user.id);
  }
}
