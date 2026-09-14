import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AIGatewayModule, AIGatewayService } from './gateway';
import { AgentRegistryModule, AgentRegistryService } from './registry';
import { MemoryModule } from './memory/memory.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';
import { FinancialAssistantAgent } from './registry/agents/financial-assistant.agent';

@Module({
  imports: [
    ConfigModule,
    AIGatewayModule,
    AgentRegistryModule,
    MemoryModule,
    OrchestratorModule,
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AIModule implements OnModuleInit {
  private readonly logger = new Logger(AIModule.name);

  constructor(
    private readonly registry: AgentRegistryService,
    private readonly gateway: AIGatewayService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.gateway.initialize();

    this.registry.register({
      id: FinancialAssistantAgent.definition.id,
      name: FinancialAssistantAgent.definition.name,
      description: FinancialAssistantAgent.definition.description,
      version: FinancialAssistantAgent.definition.version,
      isEnabled: this.configService.get('AI_GATEWAY_ENABLED', false),
      modelConfig: FinancialAssistantAgent.definition.modelConfig,
      systemInstructions: FinancialAssistantAgent.definition.systemInstructions,
      capabilities: FinancialAssistantAgent.definition.capabilities,
      allowedTools: FinancialAssistantAgent.definition.allowedTools,
    });

    this.logger.log('AI Module initialized successfully');
  }
}
