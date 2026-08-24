import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenService } from './token.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async createSession(userId: string, refreshTokenHash: string, deviceId?: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    let device = null;
    if (deviceId) {
      device = await this.prisma.device.upsert({
        where: { deviceId },
        update: { lastSeenAt: new Date() },
        create: { deviceId, platform: 'unknown', userId },
      });
    }

    return this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt,
        device: device ? { connect: { id: device.id } } : undefined,
      },
      include: { device: true },
    });
  }

  async findByRefreshTokenHash(hash: string) {
    return this.prisma.session.findFirst({
      where: {
        refreshTokenHash: hash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { device: true },
    });
  }

  async revokeSession(sessionId: string, userId: string) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });
  }

  async rotateRefreshToken(oldRefreshToken: string, newHash: string) {
    const oldHash = await this.tokenService.hashRefreshToken(oldRefreshToken);
    const session = await this.findByRefreshTokenHash(oldHash);
    if (!session) {
      throw new Error('Invalid refresh token');
    }

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newHash,
        expiresAt: newExpiresAt,
        revokedAt: new Date(),
      },
    });

    return this.prisma.session.create({
      data: {
        userId: session.userId,
        refreshTokenHash: newHash,
        expiresAt: newExpiresAt,
        deviceId: session.deviceId,
      },
      include: { device: true },
    });
  }
}
