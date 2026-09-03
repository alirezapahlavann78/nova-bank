import { Controller, Get, Post, UseGuards, Request, Query, Body, Param } from '@nestjs/common';
import { InvestmentTransactionsService } from './investment-transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('investments/transactions')
@UseGuards(JwtAuthGuard)
export class InvestmentTransactionsController {
  constructor(private readonly investmentTransactionsService: InvestmentTransactionsService) {}

  @Get() async findAll(@Request() req: any, @Query() query: any) {
    return this.investmentTransactionsService.findAll(req.user.id, query);
  }

  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) {
    return this.investmentTransactionsService.findOne(id, req.user.id);
  }

  @Post() async create(@Request() req: any, @Body() dto: any) {
    return this.investmentTransactionsService.create(req.user.id, dto);
  }
}
