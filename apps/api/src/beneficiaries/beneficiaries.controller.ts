import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('beneficiaries')
@UseGuards(JwtAuthGuard)
export class BeneficiariesController {
  constructor(private readonly beneficiariesService: BeneficiariesService) {}

  @Get() async findAll(@Request() req: any) {
    return this.beneficiariesService.findAll(req.user.id);
  }

  @Get(':id') async findOne(@Request() req: any, @Param('id') id: string) {
    return this.beneficiariesService.findOne(id, req.user.id);
  }

  @Post() async create(@Request() req: any, @Body() dto: CreateBeneficiaryDto) {
    return this.beneficiariesService.create(req.user.id, dto);
  }

  @Delete(':id') async remove(@Request() req: any, @Param('id') id: string) {
    return this.beneficiariesService.remove(id, req.user.id);
  }

  @Patch(':id') async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateBeneficiaryDto) {
    return this.beneficiariesService.update(id, req.user.id, dto);
  }
}
