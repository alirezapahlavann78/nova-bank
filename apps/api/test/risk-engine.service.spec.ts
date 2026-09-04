import { Test, TestingModule } from '@nestjs/testing';
import { RiskEngineService } from '../src/common/risk-engine.service';

describe('RiskEngineService', () => {
  let service: RiskEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiskEngineService],
    }).compile();
    service = module.get<RiskEngineService>(RiskEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should approve normal domestic transfers', () => {
    const result = service.evaluate('1', 500000, 'IRT', 'ACCOUNT');
    expect(result.action).toBe('APPROVE');
  });

  it('should review high amount payments', () => {
    const result = service.evaluate('1', 600000000, 'IRT', 'ACCOUNT');
    expect(result.action).toBe('REVIEW');
  });

  it('should review high USD amounts', () => {
    const result = service.evaluate('1', 20000, 'USD', 'ACCOUNT');
    expect(result.action).toBe('REVIEW');
  });

  it('should review high charity amounts', () => {
    const result = service.evaluate('1', 60000000, 'IRT', 'CHARITY');
    expect(result.action).toBe('REVIEW');
  });

  it('should mark medium risk for mid-range USD amounts', () => {
    const result = service.evaluate('1', 7000, 'USD', 'ACCOUNT');
    expect(result.action).toBe('MEDIUM');
  });

  it('should mark medium risk for mid-range charity amounts', () => {
    const result = service.evaluate('1', 20000000, 'IRT', 'CHARITY');
    expect(result.action).toBe('MEDIUM');
  });
});
