import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateCreditProfileData {
  internalScore?: number;
  scoreBand?: string;
  totalDebt?: number;
  activeLoans?: number;
  repaymentHistory?: string;
  utilization?: number;
  scoringVersion?: string;
  lastCalculatedAt?: Date;
}

@Injectable()
export class CreditProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    let profile = await this.prisma.creditProfile.findUnique({
      where: { userId },
      include: { scoreHistory: { orderBy: { calculatedAt: 'desc' }, take: 10 } },
    });

    if (!profile) {
      profile = (await this.prisma.creditProfile.create({
        data: {
          userId,
          internalScore: 500,
          scoreBand: 'FAIR' as any,
          totalDebt: 0,
          activeLoans: 0,
          repaymentHistory: 'GOOD',
          utilization: 0,
          scoringVersion: '1.0',
        },
      })) as any;
    }

    return profile;
  }

  async updateProfile(userId: string, data: UpdateCreditProfileData) {
    const profile = await this.prisma.creditProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Credit profile not found');

    return this.prisma.creditProfile.update({
      where: { userId },
      data: {
        ...data,
        scoreBand: data.scoreBand as any,
        updatedAt: new Date(),
      },
    });
  }

  async recalculateScore(userId: string, score: number, band: string, reasons?: string) {
    const profile = await this.getProfile(userId);
    const previousScore = profile!.internalScore;

    const updated = await this.prisma.creditProfile.update({
      where: { userId },
      data: {
        internalScore: score,
        scoreBand: band as any,
        lastCalculatedAt: new Date(),
        scoringVersion: '1.0',
      },
    });

    await this.prisma.creditScoreHistory.create({
      data: {
        userId,
        creditProfileId: profile!.id,
        score,
        previousScore,
        reason: reasons,
      },
    });

    return { profile: updated, previousScore, newScore: score };
  }
}
