import { Test, TestingModule } from '@nestjs/testing';
import { BeneficiariesService } from '../src/beneficiaries/beneficiaries.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('BeneficiariesService', () => {
  let service: BeneficiariesService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prisma = {
      beneficiary: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), delete: jest.fn(), update: jest.fn() },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [BeneficiariesService, PrismaService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<BeneficiariesService>(BeneficiariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne should throw NotFoundException for missing beneficiary', async () => {
    prisma.beneficiary.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', '1')).rejects.toThrow('Beneficiary not found');
  });

  it('remove should throw NotFoundException for missing beneficiary', async () => {
    prisma.beneficiary.findFirst.mockResolvedValue(null);
    await expect(service.remove('missing', '1')).rejects.toThrow('Beneficiary not found');
  });

  it('update should throw NotFoundException for missing beneficiary', async () => {
    prisma.beneficiary.findFirst.mockResolvedValue(null);
    await expect(service.update('missing', '1', { name: 'Updated' })).rejects.toThrow('Beneficiary not found');
  });

  it('update should successfully update a beneficiary', async () => {
    prisma.beneficiary.findFirst.mockResolvedValue({ id: '1', name: 'Old Name' } as any);
    prisma.beneficiary.update.mockResolvedValue({ id: '1', name: 'Updated Name' } as any);
    const result = await service.update('1', '1', { name: 'Updated Name' });
    expect(result.name).toBe('Updated Name');
    expect(prisma.beneficiary.update).toHaveBeenCalled();
  });
});
