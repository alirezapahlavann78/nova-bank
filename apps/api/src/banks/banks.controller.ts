import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BanksService } from './banks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('banks')
@UseGuards(JwtAuthGuard)
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get() async findAll() { return this.banksService.findAll(); }
  @Get(':id') async findOne(@Param('id') id: string) { return this.banksService.findOne(id); }
}