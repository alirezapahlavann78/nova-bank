import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { InvestmentAccountsService } from './investment-accounts.service';
import { CreateInvestmentAccountDto } from './dto/investment-account.dto';
import { UpdateInvestmentAccountDto } from './dto/investment-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('investments/accounts')
@UseGuards(JwtAuthGuard)
export class InvestmentAccountsController {
  constructor(private readonly investmentAccountsService: InvestmentAccountsService) {}

  @Get() async findAll(@Request() req: any, @Query() query: any) {
    return this.investmentAccountsService.findAll(req.user.id, query);
  }

  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) {
    return this.investmentAccountsService.findOne(id, req.user.id);
  }

  @Post() async create(@Request() req: any, @Body() dto: CreateInvestmentAccountDto) {
    return this.investmentAccountsService.create(req.user.id, dto);
  }

  @Patch(':id') async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateInvestmentAccountDto) {
    return this.investmentAccountsService.update(id, req.user.id, dto);
  }

  @Delete(':id') async remove(@Request() req: any, @Param('id') id: string) {
    return this.investmentAccountsService.remove(id, req.user.id);
  }
}
