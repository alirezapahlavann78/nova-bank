import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProviderAdapter, GatewayRequest, GatewayResponse, AIGatewayConfig } from './interfaces/provider-adapter.interface';
import { HttpProviderAdapter } from './adapters/http-provider.adapter';
import { MockProviderAdapter } from './adapters/mock-provider.adapter';

@Injectable()
export class AIGatewayService {
  private readonly logger = new Logger(AIGatewayService.name);
  private readonly config: AIGatewayConfig;
  private adapter: ProviderAdapter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      enabled: configService.get('AI_GATEWAY_ENABLED', false),
      provider: configService.get('AI_PROVIDER', 'mock'),
      apiKey: configService.get('AI_PROVIDER_API_KEY'),
      defaultModel: configService.get('AI_DEFAULT_MODEL', 'gpt-4o-mini'),
      maxTokens: configService.get('AI_MAX_TOKENS', 4096),
      timeoutMs: configService.get('AI_TIMEOUT_MS', 30000),
      maxRetries: configService.get('AI_MAX_RETRIES', 3),
    };
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.warn('AI Gateway is disabled (AI_GATEWAY_ENABLED=false). Using mock adapter.');
      this.adapter = new MockProviderAdapter(this.config);
      return;
    }

    if (!this.config.apiKey) {
      this.logger.warn('AI_GATEWAY_ENABLED=true but AI_PROVIDER_API_KEY is not set. Using mock adapter.');
      this.adapter = new MockProviderAdapter(this.config);
      return;
    }

    this.adapter = new HttpProviderAdapter(this.config);
    this.logger.log(`AI Gateway initialized with provider: ${this.config.provider}, model: ${this.config.defaultModel}`);
  }

  getAdapter(): ProviderAdapter {
    if (!this.adapter) {
      throw new InternalServerErrorException('AI Gateway not initialized. Call initialize() first.');
    }
    return this.adapter;
  }

  getConfig(): AIGatewayConfig {
    return { ...this.config };
  }

  isEnabled(): boolean {
    return this.config.enabled && !!this.config.apiKey;
  }

  async healthCheck(): Promise<{ provider: string; model: string; available: boolean }> {
    if (!this.adapter) {
      this.adapter = new MockProviderAdapter(this.config);
    }
    return {
      provider: this.adapter.providerName,
      model: this.adapter.model,
      available: await this.adapter.isAvailable(),
    };
  }
}
