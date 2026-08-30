import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsController } from '../src/budgets/budgets.controller';
import { BudgetsService } from '../src/budgets/budgets.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('BudgetsController', () => {
  let controller: BudgetsController;
  let service: jest.Mocked<BudgetsService>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetsController],
      providers: [BudgetsService, PrismaService, { provide: BudgetsService, useValue: service }],
    }).compile();

    controller = module.get<BudgetsController>(BudgetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should call service', async () => {
    service.findAll.mockResolvedValue([]);
    const req = { user: { id: '1' } } as any;
    const result = await controller.findAll(req, {});
    expect(service.findAll).toHaveBeenCalledWith('1', {});
  });
});