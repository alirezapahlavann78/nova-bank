import { Test, TestingModule } from '@nestjs/testing';
import { CreditProfileService } from '../src/credit/credit-profile.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CreditProfileService', () => {
  let service: CreditProfileService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prisma = {
      creditProfile: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      creditScoreHistory: { create: jest.fn() },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditProfileService, PrismaService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CreditProfileService>(CreditProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return existing profile', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        internalScore: 650,
        scoreBand: 'GOOD',
        scoreHistory: [],
      };
      prisma.creditProfile.findUnique.mockResolvedValue(mockProfile as any);

      const result = await service.getProfile('user-1');
      expect(result).toEqual(mockProfile);
    });

    it('should create new profile if none exists', async () => {
      prisma.creditProfile.findUnique.mockResolvedValue(null);
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        internalScore: 500,
        scoreBand: 'FAIR',
        scoreHistory: [],
      };
      prisma.creditProfile.create.mockResolvedValue(mockProfile as any);

      const result = await service.getProfile('user-1');
      expect(prisma.creditProfile.create).toHaveBeenCalled();
      expect(result.userId).toBe('user-1');
      expect(result.internalScore).toBe(500);
    });
  });

  describe('updateProfile', () => {
    it('should throw NotFoundException if profile not found', async () => {
      prisma.creditProfile.findUnique.mockResolvedValue(null);
      await expect(service.updateProfile('user-1', { internalScore: 700 })).rejects.toThrow(NotFoundException);
    });

    it('should update profile when found', async () => {
      prisma.creditProfile.findUnique.mockResolvedValue({ id: 'profile-1' } as any);
      prisma.creditProfile.update.mockResolvedValue({ id: 'profile-1', internalScore: 700 } as any);

      const result = await service.updateProfile('user-1', { internalScore: 700 });
      expect(prisma.creditProfile.update).toHaveBeenCalled();
      expect(result.internalScore).toBe(700);
    });
  });

  describe('recalculateScore', () => {
    it('should update score and create score history', async () => {
      prisma.creditProfile.findUnique.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        internalScore: 500,
      } as any);
      prisma.creditProfile.update.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        internalScore: 750,
      } as any);
      prisma.creditScoreHistory.create.mockResolvedValue({} as any);

      const result = await service.recalculateScore('user-1', 750, 'GOOD', 'manual_update');
      expect(result.newScore).toBe(750);
      expect(result.previousScore).toBe(500);
      expect(prisma.creditScoreHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          score: 750,
          previousScore: 500,
        }),
      });
    });
  });
});
