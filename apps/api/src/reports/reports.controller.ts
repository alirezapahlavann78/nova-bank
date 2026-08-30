import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  async getSummary(@Request() req: any) {
    return this.reportsService.getSummary(req.user.id);
  }

  @Get('income-expense')
  async getIncomeExpense(@Request() req: any) {
    return this.reportsService.getIncomeExpense(req.user.id);
  }

  @Get('by-category')
  async getByCategory(@Request() req: any, @Query() query: any) {
    return this.reportsService.getByCategory(req.user.id, query);
  }

  @Get('overview')
  async getOverview(@Request() req: any, @Query() query: any) {
    return this.reportsService.getOverview(req.user.id, query);
  }

  @Get('trends')
  async getTrends(@Request() req: any, @Query() query: any) {
    return this.reportsService.getTrends(req.user.id, query);
  }

  @Get('category-breakdown')
  async getCategoryBreakdown(@Request() req: any, @Query() query: any) {
    return this.reportsService.getCategoryBreakdown(req.user.id, query);
  }

  @Get('budget-performance')
  async getBudgetPerformance(@Request() req: any) {
    return this.reportsService.getBudgetPerformance(req.user.id);
  }

  @Get('goal-progress')
  async getGoalProgress(@Request() req: any) {
    return this.reportsService.getGoalProgress(req.user.id);
  }
}