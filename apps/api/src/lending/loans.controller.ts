import { Controller, Get, Post, Body, Param, UseGuards, Request, Headers, BadRequestException } from '@nestjs/common';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { randomUUID } from 'crypto';

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.loansService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loansService.findOne(id, req.user.id);
  }

  @Post(':id/activate')
  async activate(@Request() req: any, @Param('id') id: string, @Body() body: { startDate?: string }) {
    const requestId = req.headers['x-request-id'] || randomUUID();
    return this.loansService.activate(id, req.user.id, body?.startDate);
  }

  @Get(':id/installments')
  async getInstallments(@Request() req: any, @Param('id') id: string) {
    return this.loansService.getInstallments(req.user.id, id);
  }

  @Post(':id/pay')
  async payInstallment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { amount: number },
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!body.amount || body.amount <= 0) throw new BadRequestException('Invalid payment amount');
    return this.loansService.makePayment(req.user.id, id, body.amount, idempotencyKey);
  }

  @Get(':id/default')
  async checkDefault(@Request() req: any, @Param('id') id: string) {
    const loan = await this.loansService.findOne(id, req.user.id);
    const overdueInstallments = (await this.loansService.getInstallments(req.user.id, id)).filter((i: any) => i.status === 'OVERDUE');
    return { isOverdue: overdueInstallments.length > 0, overdueCount: overdueInstallments.length };
  }
}
