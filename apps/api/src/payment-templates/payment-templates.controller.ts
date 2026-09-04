import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { PaymentTemplatesService } from './payment-templates.service';
import { CreatePaymentTemplateDto } from './dto/create-payment-template.dto';
import { UpdatePaymentTemplateDto } from './dto/update-payment-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment-templates')
@UseGuards(JwtAuthGuard)
export class PaymentTemplatesController {
  constructor(private readonly paymentTemplatesService: PaymentTemplatesService) {}

  @Get() async findAll(@Request() req: any) {
    return this.paymentTemplatesService.findAll(req.user.id);
  }

  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) {
    return this.paymentTemplatesService.findOne(id, req.user.id);
  }

  @Post() async create(@Request() req: any, @Body() dto: CreatePaymentTemplateDto) {
    return this.paymentTemplatesService.create(req.user.id, dto);
  }

  @Delete(':id') async remove(@Request() req: any, @Param('id') id: string) {
    return this.paymentTemplatesService.remove(id, req.user.id);
  }

  @Patch(':id') async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdatePaymentTemplateDto) {
    return this.paymentTemplatesService.update(id, req.user.id, dto);
  }
}
