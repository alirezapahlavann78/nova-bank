import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, BadRequestException } from '@nestjs/common';
import { LoanApplicationsService } from './loan-applications.service';
import { CreateLoanApplicationDto } from './dto/create-loan-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { randomUUID } from 'crypto';

@Controller('loan-applications')
@UseGuards(JwtAuthGuard)
export class LoanApplicationsController {
  constructor(private readonly loanApplicationsService: LoanApplicationsService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.loanApplicationsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.loanApplicationsService.findOne(id, req.user.id);
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateLoanApplicationDto) {
    return this.loanApplicationsService.create(req.user.id, dto);
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: { purpose?: string; durationMonths?: number }) {
    return this.loanApplicationsService.update(id, req.user.id, dto);
  }

  @Post(':id/submit')
  async submit(@Request() req: any, @Param('id') id: string) {
    const requestId = req.headers['x-request-id'] || randomUUID();
    return this.loanApplicationsService.submit(id, req.user.id, requestId);
  }

  @Post(':id/review')
  async review(@Request() req: any, @Param('id') id: string, @Body() body: { decision: 'APPROVE' | 'REJECT'; reason?: string }) {
    if (!body.decision) throw new BadRequestException('Decision is required');
    const requestId = req.headers['x-request-id'] || randomUUID();
    return this.loanApplicationsService.review(id, req.user.id, body.decision, body.reason, requestId);
  }

  @Post(':id/cancel')
  async cancel(@Request() req: any, @Param('id') id: string) {
    const requestId = req.headers['x-request-id'] || randomUUID();
    return this.loanApplicationsService.cancel(id, req.user.id, requestId);
  }
}
