import { MockProviderAdapter } from '../src/ai/gateway/adapters/mock-provider.adapter';
import { AIGatewayConfig } from '../src/ai/gateway/interfaces/provider-adapter.interface';
import { AIGatewayService } from '../src/ai/gateway/ai-gateway.service';

describe('MockProviderAdapter', () => {
  let adapter: MockProviderAdapter;

  const config: AIGatewayConfig = {
    enabled: false,
    provider: 'mock',
    defaultModel: 'gpt-4o-mini',
    maxTokens: 2048,
    timeoutMs: 30000,
    maxRetries: 3,
  };

  beforeEach(() => {
    adapter = new MockProviderAdapter(config);
  });

  it('should have correct provider name and model', () => {
    expect(adapter.providerName).toBe('mock');
    expect(adapter.model).toBe('gpt-4o-mini');
  });

  it('should return a success response for balance queries', async () => {
    const response = await adapter.chat({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'موجودی حساب‌های من چقدره؟' }],
      tools: [{ type: 'function', function: { name: 'getAccounts', description: 'test', parameters: {} } }],
      requestId: 'test-req-1',
    });

    expect(response.provider).toBe('mock');
    expect(response.model).toBe('gpt-4o-mini');
    expect(response.requestId).toBe('test-req-1');
    expect(response.toolCalls.length).toBeGreaterThan(0);
    expect(response.toolCalls[0].toolName).toBe('getAccounts');
    expect(response.toolCalls[1].toolName).toBe('getAccountBalance');
  });

  it('should return tool calls for expense queries', async () => {
    const response = await adapter.chat({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'این ماه چقدر خرج کردم؟' }],
      tools: [],
      requestId: 'test-req-2',
    });

    expect(response.toolCalls.some((tc) => tc.toolName === 'getReports')).toBe(true);
  });

  it('should be available', async () => {
    const available = await adapter.isAvailable();
    expect(available).toBe(true);
  });
});

describe('AIGatewayService', () => {
  const createMockConfigService = (mapping: Record<string, any>) => ({
    get: jest.fn((key: string, defaultValue?: any) => mapping[key] ?? defaultValue),
  });

  it('should initialize with mock adapter when disabled', async () => {
    const mockConfigService = createMockConfigService({
      AI_GATEWAY_ENABLED: false,
      AI_PROVIDER: 'mock',
      AI_DEFAULT_MODEL: 'gpt-4o-mini',
      AI_MAX_TOKENS: 2048,
      AI_TIMEOUT_MS: 30000,
      AI_MAX_RETRIES: 3,
    });

    const service = new AIGatewayService(mockConfigService as any);
    await service.initialize();

    const adapter = service.getAdapter();
    expect(adapter.providerName).toBe('mock');
    expect(service.isEnabled()).toBe(false);
  });

  it('should initialize with mock adapter when API key is missing', async () => {
    const mockConfigService = createMockConfigService({
      AI_GATEWAY_ENABLED: true,
      AI_PROVIDER: 'openai',
      AI_PROVIDER_API_KEY: undefined,
      AI_DEFAULT_MODEL: 'gpt-4o',
      AI_MAX_TOKENS: 4096,
      AI_TIMEOUT_MS: 30000,
      AI_MAX_RETRIES: 3,
    });

    const service = new AIGatewayService(mockConfigService as any);
    await service.initialize();

    expect(service.getAdapter().providerName).toBe('mock');
    expect(service.isEnabled()).toBe(false);
  });
});
