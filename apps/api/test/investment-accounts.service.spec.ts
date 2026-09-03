import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentAccountsService } from '../src/investments/investment-accounts.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('InvestmentAccountsService', () => {
  let service: InvestmentAccountsService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prisma = {
      investmentAccount: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvestmentAccountsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<InvestmentAccountsService>(InvestmentAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated investment accounts scoped to user', async () => {
      const mockAccounts = [
        { id: 'acc1', userId: 'user1', accountType: 'BROKERAGE', status: 'ACTIVE', cashBalance: 1000, totalValue: 5000, createdAt: new Date(), updatedAt: new Date() },
        { id: 'acc2', userId: 'user1', accountType: 'RETIREMENT', status: 'ACTIVE', cashBalance: 2000, totalValue: 10000, createdAt: new Date(), updatedAt: new Date() },
      ];
      prisma.investmentAccount.findMany.mockResolvedValue(mockAccounts);
      prisma.investmentAccount.count.mockResolvedValue(2);

      const result = await service.findAll('user1', { page: 1, limit: 20 });

      expect(result.data.length).toBe(2);
      expect(result.meta.total).toBe(2);
      expect(result.data[0].userId).toBe('user1');
      expect(prisma.investmentAccount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1' },
        }),
      );
    });

    it('should filter by status', async () => {
      prisma.investmentAccount.findMany.mockResolvedValue([]);
      prisma.investmentAccount.count.mockResolvedValue(0);

      await service.findAll('user1', { status: 'ACTIVE' });

      expect(prisma.investmentAccount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user1', status: 'ACTIVE' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing account', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue(null);
      await expect(service.findOne('missing', 'user1')).rejects.toThrow(NotFoundException);
    });

    it('should return account with holdings', async () => {
      const mockAccount = {
        id: 'acc1',
        userId: 'user1',
        accountType: 'BROKERAGE',
        status: 'ACTIVE',
        cashBalance: 1000,
        totalValue: 5000,
        createdAt: new Date(),
        updatedAt: new Date(),
        holdings: [],
      };
      prisma.investmentAccount.findFirst.mockResolvedValue(mockAccount);

      const result = await service.findOne('acc1', 'user1');
      expect(result.id).toBe('acc1');
      expect(result.holdings).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create investment account with defaults', async () => {
      const mockAccount = {
        id: 'acc1',
        userId: 'user1',
        accountType: 'BROKERAGE',
        status: 'ACTIVE',
        cashBalance: 0,
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.investmentAccount.create.mockResolvedValue(mockAccount);

      const result = await service.create('user1', { brokerName: 'Test Broker' });

      expect(result.id).toBe('acc1');
      expect(result.userId).toBe('user1');
      expect(prisma.investmentAccount.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user1',
            brokerName: 'Test Broker',
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when account does not belong to user', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue(null);
      await expect(service.update('acc1', 'wrong-user', { brokerName: 'New Broker' })).rejects.toThrow(NotFoundException);
    });

    it('should update account successfully', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue({ id: 'acc1', userId: 'user1' });
      prisma.investmentAccount.update.mockResolvedValue({
        id: 'acc1',
        userId: 'user1',
        accountType: 'BROKERAGE',
        status: 'ACTIVE',
        cashBalance: 1000,
        totalValue: 5000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.update('acc1', 'user1', { brokerName: 'Updated Broker' });
      expect(result.userId).toBe('user1');
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException for missing account', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing', 'user1')).rejects.toThrow(NotFoundException);
    });

    it('should soft-delete (close) account', async () => {
      prisma.investmentAccount.findFirst.mockResolvedValue({ id: 'acc1', userId: 'user1' });
      prisma.investmentAccount.update.mockResolvedValue({ id: 'acc1', status: 'CLOSED' });

      const result = await service.remove('acc1', 'user1');
      expect(result.success).toBe(true);
      expect(prisma.investmentAccount.update).toHaveBeenCalledWith({
        where: { id: 'acc1' },
        data: { status: 'CLOSED' },
      });
    });
  });
});
