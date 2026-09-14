import { Controller, Get, UseGuards, Request, Param, Query } from '@nestjs/common';
import { LoanPaymentsService } from './loan-payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('loan-payments')
@UseGuards(JwtAuthGuard)
export class LoanPaymentsController {
  constructor(private readonly loanPaymentsService: LoanPaymentsService) {}

  @Get()
  async findAll(
    @Request() req: any,
    @Query('loanId') loanId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.loanPaymentsService.findAll(req.user.id, loanId, limit ? parseInt(limit, 10) : undefined);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loanPaymentsService.findOne(id, req.user.id);
  }
}
