import { Module } from '@nestjs/common';
import { AgentRegistryService } from './agent-registry.service';
import { FinancialAssistantAgent } from './agents/financial-assistant.agent';

@Module({
  providers: [AgentRegistryService, FinancialAssistantAgent],
  exports: [AgentRegistryService],
})
export class AgentRegistryModule {}
