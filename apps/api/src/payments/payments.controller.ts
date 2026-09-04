import { Controller, Get, Post, Body, Param, UseGuards, Request, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { randomUUID } from 'crypto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get() async findAll(@Request() req: any) {
    return this.paymentsService.findAll(req.user.id);
  }

  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.findOne(id, req.user.id);
  }

  @Get(':id/audit') async getAudit(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.getAuditTrail(id, req.user.id);
  }

  @Post() async create(@Request() req: any, @Body() dto: CreatePaymentDto, @Headers('idempotency-key') idempotencyKey?: string) {
    const requestId = req.headers['x-request-id'] || randomUUID();
    return this.paymentsService.create(req.user.id, dto, idempotencyKey, requestId);
  }

  @Post(':id/cancel') async cancel(@Request() req: any, @Param('id') id: string) {
    const requestId = req.headers['x-request-id'] || randomUUID();
    return this.paymentsService.cancel(id, req.user.id, requestId);
  }
}
