import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get() async findAll(@Request() req: any) { return this.cardsService.findAll(req.user.id); }
  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) { return this.cardsService.findOne(id, req.user.id); }
  @Post() async create(@Request() req: any, @Body() dto: CreateCardDto) { return this.cardsService.create(req.user.id, dto); }
  @Patch(':id') async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateCardDto) { return this.cardsService.update(id, req.user.id, dto); }
  @Delete(':id') async remove(@Request() req: any, @Param('id') id: string) { return this.cardsService.remove(id, req.user.id); }
}