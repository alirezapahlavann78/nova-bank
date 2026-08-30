import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { GoalProgressDto } from './dto/goal-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get() async findAll(@Request() req: any) {
    return this.goalsService.findAll(req.user.id);
  }

  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) {
    return this.goalsService.findOne(id, req.user.id);
  }

  @Post() async create(@Request() req: any, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(req.user.id, dto);
  }

  @Patch(':id') async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.goalsService.update(id, req.user.id, dto);
  }

  @Delete(':id') async remove(@Request() req: any, @Param('id') id: string) {
    return this.goalsService.remove(id, req.user.id);
  }

  @Post(':id/progress') async addProgress(@Request() req: any, @Param('id') id: string, @Body() dto: GoalProgressDto) {
    return this.goalsService.addProgress(id, req.user.id, dto.amount);
  }
}