import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduledPaymentDto } from './dto/create-scheduled-payment.dto';
import { UpdateScheduledPaymentDto } from './dto/update-scheduled-payment.dto';

@Injectable()
export class ScheduledPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.scheduledPayment.findMany({ where: { userId, status: 'ACTIVE' }, orderBy: { nextRunAt: 'asc' } });
  }

  async findOne(id: string, userId: string) {
    const scheduled = await this.prisma.scheduledPayment.findFirst({ where: { id, userId } });
    if (!scheduled) throw new NotFoundException('Scheduled payment not found');
    return scheduled;
  }

  async create(userId: string, dto: CreateScheduledPaymentDto) {
    const source = await this.prisma.account.findFirst({ where: { id: dto.sourceAccountId, userId } });
    if (!source) throw new NotFoundException('Source account not found');
    if (!source.isActive) throw new BadRequestException('Cannot schedule payment from inactive account');

    return this.prisma.scheduledPayment.create({
      data: {
        userId,
        type: dto.type as any,
        amount: dto.amount,
        currency: dto.currency as any,
        sourceAccountId: dto.sourceAccountId,
        destinationType: dto.destinationType as any,
        destinationValue: dto.destinationValue,
        frequency: dto.frequency as any,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        nextRunAt: new Date(dto.startDate),
        maxRuns: dto.maxRuns,
        description: dto.description,
        templateId: dto.templateId,
        status: 'ACTIVE',
      },
    });
  }

  async pause(id: string, userId: string) {
    const scheduled = await this.prisma.scheduledPayment.findFirst({ where: { id, userId } });
    if (!scheduled) throw new NotFoundException('Scheduled payment not found');
    return this.prisma.scheduledPayment.update({ where: { id }, data: { status: 'PAUSED' } });
  }

  async resume(id: string, userId: string) {
    const scheduled = await this.prisma.scheduledPayment.findFirst({ where: { id, userId } });
    if (!scheduled) throw new NotFoundException('Scheduled payment not found');
    return this.prisma.scheduledPayment.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  async remove(id: string, userId: string) {
    const scheduled = await this.prisma.scheduledPayment.findFirst({ where: { id, userId } });
    if (!scheduled) throw new NotFoundException('Scheduled payment not found');
    await this.prisma.scheduledPayment.update({ where: { id }, data: { status: 'CANCELLED' } });
    return { success: true };
  }

  async update(id: string, userId: string, dto: UpdateScheduledPaymentDto) {
    const scheduled = await this.prisma.scheduledPayment.findFirst({ where: { id, userId } });
    if (!scheduled) throw new NotFoundException('Scheduled payment not found');
    if (scheduled.status === 'CANCELLED') throw new BadRequestException('Cannot update cancelled scheduled payment');

    const data: any = { updatedAt: new Date() };
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.currency) data.currency = dto.currency;
    if (dto.destinationType) data.destinationType = dto.destinationType;
    if (dto.destinationValue) data.destinationValue = dto.destinationValue;
    if (dto.frequency) data.frequency = dto.frequency;
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    if (dto.maxRuns !== undefined) data.maxRuns = dto.maxRuns;
    if (dto.description !== undefined) data.description = dto.description;

    return this.prisma.scheduledPayment.update({ where: { id }, data });
  }
}
