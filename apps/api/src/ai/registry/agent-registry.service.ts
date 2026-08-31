import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { AIAgentMetadata, AISystemInstructions, AIAgentCapability, AIToolDefinition, AIToolRiskLevel } from '@nova-bank/types';
import { ToolRegistration, ToolExecutionResult, ToolExecutionContext } from '../tools/interfaces/tool-execution-context.interface';

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  isEnabled: boolean;
  modelConfig: AIAgentMetadata['modelConfig'];
  systemInstructions: AISystemInstructions;
  capabilities: AIAgentCapability[];
  allowedTools: string[];
}

@Injectable()
export class AgentRegistryService implements OnModuleInit {
  private readonly logger = new Logger(AgentRegistryService.name);
  private readonly agents: Map<string, AgentDefinition> = new Map();

  onModuleInit() {
    this.logger.log('Agent Registry initialized');
  }

  register(agent: AgentDefinition): void {
    if (this.agents.has(agent.id)) {
      this.logger.warn(`Agent '${agent.id}' is already registered. Overwriting.`);
    }
    this.agents.set(agent.id, agent);
    this.logger.log(`Registered agent: ${agent.name} (${agent.version})`);
  }

  getAgent(agentId: string): AgentDefinition | undefined {
    return this.agents.get(agentId);
  }

  getEnabledAgents(): AgentDefinition[] {
    return Array.from(this.agents.values()).filter((a) => a.isEnabled);
  }

  getAllAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  getDefaultAgent(): AgentDefinition | undefined {
    const enabled = this.getEnabledAgents();
    return enabled.find((a) => a.id === 'financial-assistant') || enabled[0];
  }

  isAgentEnabled(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    return agent?.isEnabled ?? false;
  }

  getAgentTools(agentId: string): string[] {
    const agent = this.agents.get(agentId);
    if (!agent || !agent.isEnabled) {
      throw new NotFoundException(`Agent '${agentId}' not found or not enabled`);
    }
    return agent.allowedTools;
  }
}
