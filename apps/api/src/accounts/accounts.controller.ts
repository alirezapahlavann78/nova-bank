import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get() async findAll(@Request() req: any) { return this.accountsService.findAll(req.user.id); }
  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) { return this.accountsService.findOne(id, req.user.id); }
  @Post() async create(@Request() req: any, @Body() dto: CreateAccountDto) { return this.accountsService.create(req.user.id, dto); }
  @Patch(':id') async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAccountDto) { return this.accountsService.update(id, req.user.id, dto); }
  @Delete(':id') async remove(@Request() req: any, @Param('id') id: string) { return this.accountsService.remove(id, req.user.id); }
}