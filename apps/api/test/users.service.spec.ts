import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../src/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prismaService }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findById should return user without password', async () => {
    prismaService.user.findUnique.mockResolvedValue({
      id: '1',
      phone: '09123456789',
      email: null,
      firstName: null,
      lastName: null,
      locale: 'fa-IR',
      timezone: 'Asia/Tehran',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.findById('1');
    expect(result.id).toBe('1');
    expect(result.password).toBeUndefined();
  });

  it('findById should throw NotFoundException when user does not exist', async () => {
    prismaService.user.findUnique.mockResolvedValue(null);
    await expect(service.findById('999')).rejects.toThrow('User not found');
  });
});
