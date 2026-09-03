import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('investments/assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get() async findAll(@Query() query: any) {
    return this.assetsService.findAll(query);
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }
}
