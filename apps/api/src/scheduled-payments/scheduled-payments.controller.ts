import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { ScheduledPaymentsService } from './scheduled-payments.service';
import { CreateScheduledPaymentDto } from './dto/create-scheduled-payment.dto';
import { UpdateScheduledPaymentDto } from './dto/update-scheduled-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('scheduled-payments')
@UseGuards(JwtAuthGuard)
export class ScheduledPaymentsController {
  constructor(private readonly scheduledPaymentsService: ScheduledPaymentsService) {}

  @Get() async findAll(@Request() req: any) {
    return this.scheduledPaymentsService.findAll(req.user.id);
  }

  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) {
    return this.scheduledPaymentsService.findOne(id, req.user.id);
  }

  @Post() async create(@Request() req: any, @Body() dto: CreateScheduledPaymentDto) {
    return this.scheduledPaymentsService.create(req.user.id, dto);
  }

  @Patch(':id/pause') async pause(@Request() req: any, @Param('id') id: string) {
    return this.scheduledPaymentsService.pause(id, req.user.id);
  }

  @Patch(':id/resume') async resume(@Request() req: any, @Param('id') id: string) {
    return this.scheduledPaymentsService.resume(id, req.user.id);
  }

  @Delete(':id') async remove(@Request() req: any, @Param('id') id: string) {
    return this.scheduledPaymentsService.remove(id, req.user.id);
  }

  @Patch(':id') async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateScheduledPaymentDto) {
    return this.scheduledPaymentsService.update(id, req.user.id, dto);
  }
}
