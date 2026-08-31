import { Test } from '@nestjs/testing';
import { AgentRegistryService } from '../src/ai/registry/agent-registry.service';
import { FinancialAssistantAgent } from '../src/ai/registry/agents/financial-assistant.agent';
import { NotFoundException } from '@nestjs/common';

describe('AgentRegistryService', () => {
  let service: AgentRegistryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AgentRegistryService],
    }).compile();

    service = module.get<AgentRegistryService>(AgentRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register and lookup an agent', () => {
    const agent = {
      id: 'test-agent',
      name: 'Test Agent',
      description: 'Test',
      version: '1.0.0',
      isEnabled: true,
      modelConfig: { provider: 'mock', model: 'gpt-4o', maxTokens: 2048, temperature: 0.1 },
      systemInstructions: { basePrompt: 'test', riskGuidelines: '', confirmationProtocol: '' },
      capabilities: [],
      allowedTools: ['getAccounts'],
    };

    service.register(agent);
    const found = service.getAgent('test-agent');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Test Agent');
  });

  it('should return undefined for unknown agent', () => {
    expect(service.getAgent('nonexistent')).toBeUndefined();
  });

  it('should return enabled agents only', () => {
    service.register({
      id: 'enabled-agent',
      name: 'Enabled',
      description: '',
      version: '1.0',
      isEnabled: true,
      modelConfig: { provider: 'mock', model: 'gpt-4o', maxTokens: 2048, temperature: 0.1 },
      systemInstructions: { basePrompt: '', riskGuidelines: '', confirmationProtocol: '' },
      capabilities: [],
      allowedTools: [],
    });

    service.register({
      id: 'disabled-agent',
      name: 'Disabled',
      description: '',
      version: '1.0',
      isEnabled: false,
      modelConfig: { provider: 'mock', model: 'gpt-4o', maxTokens: 2048, temperature: 0.1 },
      systemInstructions: { basePrompt: '', riskGuidelines: '', confirmationProtocol: '' },
      capabilities: [],
      allowedTools: [],
    });

    const enabled = service.getEnabledAgents();
    expect(enabled.some((a) => a.id === 'enabled-agent')).toBe(true);
    expect(enabled.some((a) => a.id === 'disabled-agent')).toBe(false);
  });

  it('should return correct tool list for an agent', () => {
    service.register({
      id: 'tool-agent',
      name: 'Tool Agent',
      description: '',
      version: '1.0',
      isEnabled: true,
      modelConfig: { provider: 'mock', model: 'gpt-4o', maxTokens: 2048, temperature: 0.1 },
      systemInstructions: { basePrompt: '', riskGuidelines: '', confirmationProtocol: '' },
      capabilities: [],
      allowedTools: ['getAccounts', 'getBudgets', 'createTransfer'],
    });

    const tools = service.getAgentTools('tool-agent');
    expect(tools).toEqual(['getAccounts', 'getBudgets', 'createTransfer']);
  });

  it('should throw NotFoundException for disabled agent tools', () => {
    service.register({
      id: 'disabled-tool-agent',
      name: '',
      description: '',
      version: '1.0',
      isEnabled: false,
      modelConfig: { provider: 'mock', model: 'gpt-4o', maxTokens: 2048, temperature: 0.1 },
      systemInstructions: { basePrompt: '', riskGuidelines: '', confirmationProtocol: '' },
      capabilities: [],
      allowedTools: [],
    });

    expect(() => service.getAgentTools('disabled-tool-agent')).toThrow(NotFoundException);
  });

  it('should have FinancialAssistantAgent defined', () => {
    expect(FinancialAssistantAgent.definition.id).toBe('financial-assistant');
    expect(FinancialAssistantAgent.definition.allowedTools).toContain('getAccounts');
    expect(FinancialAssistantAgent.definition.allowedTools).toContain('createTransfer');
  });
});
