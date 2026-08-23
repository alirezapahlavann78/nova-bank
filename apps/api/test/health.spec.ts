import { HealthService } from '../src/health/health.service';
import { PrismaService } from '../src/prisma/prisma.service';

jest.mock('../src/prisma/prisma.service');

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prismaService = {
      $queryRaw: jest.fn(),
    } as any;
    service = new HealthService(prismaService);
  });

  it('should return ok status when database is reachable', async () => {
    (prismaService.$queryRaw as jest.Mock).mockResolvedValue([]);
    const result = await service.check();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
    expect(result.info?.database).toBe('connected');
  });

  it('should return error status when database is unreachable', async () => {
    (prismaService.$queryRaw as jest.Mock).mockRejectedValue(new Error('connection failed'));
    const result = await service.check();
    expect(result.status).toBe('error');
    expect(result.error?.database).toBe('unreachable');
  });
});
