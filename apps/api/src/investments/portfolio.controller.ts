import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('investments/portfolio')
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get() async getPortfolio(@Request() req: any) {
    return this.portfolioService.getOverview(req.user.id);
  }

  @Get('overview') async getOverview(@Request() req: any) {
    return this.portfolioService.getOverview(req.user.id);
  }

  @Get('holdings') async getHoldings(@Request() req: any, @Query() query: any) {
    return this.portfolioService.getHoldings(req.user.id, query);
  }

  @Get('performance') async getPerformance(@Request() req: any, @Query() query: any) {
    return this.portfolioService.getPerformance(req.user.id, query);
  }

  @Get('allocation') async getAllocation(@Request() req: any) {
    return this.portfolioService.getAssetAllocation(req.user.id);
  }
}
