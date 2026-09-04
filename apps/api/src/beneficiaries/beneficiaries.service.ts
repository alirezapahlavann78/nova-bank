import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';

@Injectable()
export class BeneficiariesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.beneficiary.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  async findOne(id: string, userId: string) {
    const beneficiary = await this.prisma.beneficiary.findFirst({ where: { id, userId } });
    if (!beneficiary) throw new NotFoundException('Beneficiary not found');
    return beneficiary;
  }

  async create(userId: string, dto: CreateBeneficiaryDto) {
    return this.prisma.beneficiary.create({
      data: {
        userId,
        name: dto.name,
        destinationType: dto.destinationType as any,
        destinationValue: dto.destinationValue,
        bankCode: dto.bankCode,
        bankName: dto.bankName,
        isFavorite: dto.isFavorite ?? false,
      },
    });
  }

  async remove(id: string, userId: string) {
    const beneficiary = await this.prisma.beneficiary.findFirst({ where: { id, userId } });
    if (!beneficiary) throw new NotFoundException('Beneficiary not found');
    await this.prisma.beneficiary.delete({ where: { id } });
    return { success: true };
  }

  async update(id: string, userId: string, dto: UpdateBeneficiaryDto) {
    const beneficiary = await this.prisma.beneficiary.findFirst({ where: { id, userId } });
    if (!beneficiary) throw new NotFoundException('Beneficiary not found');
    return this.prisma.beneficiary.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.destinationType && { destinationType: dto.destinationType as any }),
        ...(dto.destinationValue && { destinationValue: dto.destinationValue }),
        ...(dto.bankCode !== undefined && { bankCode: dto.bankCode }),
        ...(dto.bankName !== undefined && { bankName: dto.bankName }),
        ...(dto.isFavorite !== undefined && { isFavorite: dto.isFavorite }),
      },
    });
  }
}
