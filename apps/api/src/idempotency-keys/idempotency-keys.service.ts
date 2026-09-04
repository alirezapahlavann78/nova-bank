import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdempotencyKeysService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(key: string, userId: string) {
    const record = await this.prisma.idempotencyKey.findFirst({ where: { key, userId } });
    if (!record) throw new NotFoundException('Idempotency key not found');
    return record;
  }
}
