import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentTemplateDto } from './dto/create-payment-template.dto';
import { UpdatePaymentTemplateDto } from './dto/update-payment-template.dto';

@Injectable()
export class PaymentTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.paymentTemplate.findMany({ where: { userId, isActive: true }, orderBy: { name: 'asc' } });
  }

  async findOne(id: string, userId: string) {
    const template = await this.prisma.paymentTemplate.findFirst({ where: { id, userId } });
    if (!template) throw new NotFoundException('Payment template not found');
    return template;
  }

  async create(userId: string, dto: CreatePaymentTemplateDto) {
    const data: any = {
      userId,
      name: dto.name,
      type: dto.type as any,
      destinationType: dto.destinationType as any,
      destinationValue: dto.destinationValue,
      description: dto.description,
      isActive: dto.isActive ?? true,
    };
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.sourceAccountId !== undefined) data.sourceAccountId = dto.sourceAccountId;
    if (dto.beneficiaryId !== undefined) data.beneficiaryId = dto.beneficiaryId;

    return this.prisma.paymentTemplate.create({ data });
  }

  async remove(id: string, userId: string) {
    const template = await this.prisma.paymentTemplate.findFirst({ where: { id, userId } });
    if (!template) throw new NotFoundException('Payment template not found');
    await this.prisma.paymentTemplate.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  }

  async update(id: string, userId: string, dto: UpdatePaymentTemplateDto) {
    const template = await this.prisma.paymentTemplate.findFirst({ where: { id, userId } });
    if (!template) throw new NotFoundException('Payment template not found');
    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.type) data.type = dto.type as any;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.sourceAccountId) data.sourceAccountId = dto.sourceAccountId;
    if (dto.destinationType) data.destinationType = dto.destinationType as any;
    if (dto.destinationValue) data.destinationValue = dto.destinationValue;
    if (dto.beneficiaryId) data.beneficiaryId = dto.beneficiaryId;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.paymentTemplate.update({ where: { id }, data });
  }
}
