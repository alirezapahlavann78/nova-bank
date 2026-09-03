import { Controller, Get, UseGuards, Request, Query, Param } from '@nestjs/common';
import { HoldingsService } from './holdings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('investments/holdings')
@UseGuards(JwtAuthGuard)
export class HoldingsController {
  constructor(private readonly holdingsService: HoldingsService) {}

  @Get() async findAll(@Request() req: any, @Query() query: any) {
    return this.holdingsService.findAll(req.user.id, query);
  }

  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) {
    return this.holdingsService.findOne(id, req.user.id);
  }
}
