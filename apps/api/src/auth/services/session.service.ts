import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async rotateRefreshToken(oldRefreshToken: string) {
    const oldHash = await this.tokenService.hashRefreshToken(oldRefreshToken);
    const session = await this.findByRefreshTokenHash(oldHash);
    if (!session) {
      // Reused, revoked or simply unknown token — never leak internals.
      throw new UnauthorizedException('Invalid refresh token');
    }

    // A rotation must produce a NEW token/hash — reusing the old hash
    // violates the `refreshTokenHash` unique constraint.
    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newHash = await this.tokenService.hashRefreshToken(newRefreshToken);

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    // Revoke the old session first so the same token can never be reused.
    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const fresh = await this.prisma.session.create({
      data: {
        userId: session.userId,
        refreshTokenHash: newHash,
        expiresAt: newExpiresAt,
        device: session.device ? { connect: { id: session.device.id } } : undefined,
      },
      include: { device: true },
    });

    return { ...fresh, refreshToken: newRefreshToken };
  }
}
