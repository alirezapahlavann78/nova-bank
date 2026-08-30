import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transfers')
@UseGuards(JwtAuthGuard)
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get() async findAll(@Request() req: any) {
    return this.transfersService.findAll(req.user.id);
  }

  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) {
    return this.transfersService.findOne(id, req.user.id);
  }

  @Post() async create(@Request() req: any, @Body() dto: CreateTransferDto) {
    return this.transfersService.create(req.user.id, dto);
  }
}