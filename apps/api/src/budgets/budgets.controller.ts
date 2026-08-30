import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get() async findAll(@Request() req: any, @Query() query: any) {
    return this.budgetsService.findAll(req.user.id, query);
  }

  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) {
    return this.budgetsService.findOne(id, req.user.id);
  }

  @Post() async create(@Request() req: any, @Body() dto: CreateBudgetDto) {
    return this.budgetsService.create(req.user.id, dto);
  }

  @Patch(':id') async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.budgetsService.update(id, req.user.id, dto);
  }

  @Delete(':id') async remove(@Request() req: any, @Param('id') id: string) {
    return this.budgetsService.remove(id, req.user.id);
  }
}