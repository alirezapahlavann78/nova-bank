import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { LoanInstallmentsService } from './loan-installments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('loan-installments')
@UseGuards(JwtAuthGuard)
export class LoanInstallmentsController {
  constructor(private readonly loanInstallmentsService: LoanInstallmentsService) {}

  @Get()
  async findAll(@Request() req: any, @Param('loanId') loanId?: string) {
    return this.loanInstallmentsService.findAll(req.user.id, loanId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loanInstallmentsService.findOne(id, req.user.id);
  }
}
