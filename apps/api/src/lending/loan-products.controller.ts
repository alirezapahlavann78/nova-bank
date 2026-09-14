import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete, Query, BadRequestException } from '@nestjs/common';
import { LoanProductsService } from './loan-products.service';
import { CreateLoanProductDto, UpdateLoanProductDto } from './dto/create-loan-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('loan-products')
@UseGuards(JwtAuthGuard)
export class LoanProductsController {
  constructor(private readonly loanProductsService: LoanProductsService) {}

  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    return this.loanProductsService.findAll(undefined, { activeOnly: activeOnly !== 'false' });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.loanProductsService.findOne(id);
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateLoanProductDto) {
    return this.loanProductsService.create(req.user.id, dto as any);
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateLoanProductDto) {
    return this.loanProductsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.loanProductsService.remove(id, req.user.id);
  }

  @Get(':id/estimate')
  async estimate(
    @Param('id') id: string,
    @Query('amount') amount?: string,
    @Query('duration') duration?: string,
    @Query('currency') currency?: string,
  ) {
    const product = await this.loanProductsService.findOne(id);
    if (!product.isActive) throw new BadRequestException('Product is not active');

    const requestedAmount = parseInt(amount || '0', 10);
    const durationMonths = parseInt(duration || String(product.durationMonths), 10);
    const currencyCode = currency || product.currency;

    if (requestedAmount < product.minAmount || requestedAmount > product.maxAmount) {
      throw new BadRequestException(`Amount must be between ${product.minAmount} and ${product.maxAmount}`);
    }

    const monthlyRate = product.interestRate / 12 / 100;
    let installmentAmount: number;
    if (monthlyRate === 0) {
      installmentAmount = Math.floor(requestedAmount / durationMonths);
    } else {
      const numerator = requestedAmount * monthlyRate * Math.pow(1 + monthlyRate, durationMonths);
      const denominator = Math.pow(1 + monthlyRate, durationMonths) - 1;
      installmentAmount = Math.round(numerator / denominator);
    }

    const totalPayable = Math.round(requestedAmount * (1 + product.interestRate / 100 * durationMonths));

    return {
      principal: requestedAmount,
      interestAmount: totalPayable - requestedAmount,
      totalPayable,
      installmentAmount,
      durationMonths,
      currency: currencyCode,
    };
  }
}
