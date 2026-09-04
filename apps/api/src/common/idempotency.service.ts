import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async checkAndReserve(key: string, userId: string, resourceType: string, resourceId?: string, ttlMs = 24 * 60 * 60 * 1000) {
    return this.checkAndReserveWithHash(key, userId, resourceType, undefined, resourceId, ttlMs);
  }

  async checkAndReserveWithHash(
    key: string,
    userId: string,
    resourceType: string,
    requestHash: string | undefined,
    resourceId?: string | null,
    ttlMs?: number,
  ) {
    const effectiveTtl = ttlMs ?? 24 * 60 * 60 * 1000;
    const existing = await this.prisma.idempotencyKey.findFirst({ where: { key, userId } });
    if (existing) {
      if (requestHash && existing.requestHash && existing.requestHash !== requestHash) {
        throw new ConflictException('Idempotency key used with different request payload');
      }
      if (existing.status === 'PENDING') {
        if (existing.expiresAt > new Date()) {
          throw new ConflictException('Request already in progress');
        }
        await this.prisma.idempotencyKey.update({
          where: { id: existing.id },
          data: { status: 'FAILED' },
        });
      }
      if (existing.status === 'COMPLETED') {
        return { status: 'COMPLETED', response: existing.response };
      }
      if (existing.status === 'FAILED') {
        const expiresAt = new Date(Date.now() + effectiveTtl);
        await this.prisma.idempotencyKey.update({
          where: { id: existing.id },
          data: { status: 'PENDING', requestHash, expiresAt },
        });
        return { status: 'NEW' };
      }
    }

    const expiresAt = new Date(Date.now() + effectiveTtl);
    const data: any = {
      key,
      userId,
      resourceType,
      status: 'PENDING',
      expiresAt,
    };
    if (resourceId) data.resourceId = resourceId;
    if (requestHash) data.requestHash = requestHash;

    await this.prisma.idempotencyKey.create({ data });

    return { status: 'NEW' };
  }

  async markCompleted(key: string, userId: string, response: any) {
    await this.prisma.idempotencyKey.updateMany({
      where: { key, userId, status: 'PENDING' },
      data: { status: 'COMPLETED', response },
    });
  }

  async markFailed(key: string | undefined, userId: string) {
    if (!key) return;
    await this.prisma.idempotencyKey.updateMany({
      where: { key, userId, status: 'PENDING' },
      data: { status: 'FAILED' },
    });
  }
}
