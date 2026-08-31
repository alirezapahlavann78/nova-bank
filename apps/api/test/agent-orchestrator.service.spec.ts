import { Test } from '@nestjs/testing';
import { AgentOrchestratorService } from '../src/ai/orchestrator/agent-orchestrator.service';
import { AIGatewayService } from '../src/ai/gateway/ai-gateway.service';
import { AgentRegistryService } from '../src/ai/registry/agent-registry.service';
import { ToolManagerService } from '../src/ai/tools/tool-manager.service';
import { ConversationMemoryService } from '../src/ai/memory/conversation-memory.service';
import { AuditLoggerService } from '../src/ai/logging/audit-logger.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AgentOrchestratorService', () => {
  let service: AgentOrchestratorService;

  const mockPrisma = {
    aIConversation: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    aIMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    aIAgentExecution: {
      create: jest.fn(),
      update: jest.fn(),
    },
    aIToolExecution: {
      create: jest.fn(),
    },
  };

  const mockGateway = {
    getAdapter: jest.fn(),
    initialize: jest.fn(),
  };

  const mockRegistry = {
    getAgent: jest.fn(),
    getDefaultAgent: jest.fn(),
  };

  const mockToolManager = {
    getAllowedTools: jest.fn(),
    getTool: jest.fn(),
    executeTool: jest.fn(),
  };

  const mockMemory = {
    getOrCreateConversation: jest.fn(),
    saveMessage: jest.fn(),
    getMessagesForProvider: jest.fn(),
    saveToolCall: jest.fn(),
    updateToolConfirmation: jest.fn(),
    getPendingToolCall: jest.fn(),
  };

  const mockAuditLogger = {
    logExecutionStart: jest.fn(),
    logExecutionEnd: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AgentOrchestratorService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AIGatewayService, useValue: mockGateway },
        { provide: AgentRegistryService, useValue: mockRegistry },
        { provide: ToolManagerService, useValue: mockToolManager },
        { provide: ConversationMemoryService, useValue: mockMemory },
        { provide: AuditLoggerService, useValue: mockAuditLogger },
      ],
    }).compile();

    service = module.get<AgentOrchestratorService>(AgentOrchestratorService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chat', () => {
    const mockAgent = {
      id: 'financial-assistant',
      name: 'Test Agent',
      version: '1.0.0',
      isEnabled: true,
      modelConfig: { provider: 'mock', model: 'gpt-4o-mini', maxTokens: 2048, temperature: 0.1 },
      systemInstructions: { basePrompt: 'You are a test agent', riskGuidelines: '', confirmationProtocol: '' },
      capabilities: [],
      allowedTools: ['getAccounts'],
    };

    it('should execute agent and return response for read-only tool call', async () => {
      const fakeRequestId = 'test-request-id';
      const mockAdapter = {
        chat: jest
          .fn()
          .mockResolvedValueOnce({
            content: 'Here are your accounts:',
            toolCalls: [{ id: 'call-1', toolName: 'getAccounts', arguments: {} }],
            usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80, provider: 'mock' },
            provider: 'mock',
            model: 'gpt-4o-mini',
            requestId: fakeRequestId,
          })
          .mockResolvedValueOnce({
            content: 'Your total balance is 1000 IRR.',
            toolCalls: [],
            usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18, provider: 'mock' },
            provider: 'mock',
            model: 'gpt-4o-mini',
            requestId: fakeRequestId,
          }),
        providerName: 'mock',
        model: 'gpt-4o-mini',
      };

      mockGateway.getAdapter.mockReturnValue(mockAdapter);
      mockRegistry.getDefaultAgent.mockReturnValue(mockAgent);
      mockToolManager.getAllowedTools.mockReturnValue([
        { name: 'getAccounts', confirmationRequired: false, riskLevel: 'read', permission: 'read', userScoping: true, description: 'test', parameters: {} },
      ]);
      mockMemory.getOrCreateConversation.mockResolvedValue({ id: 'conv-1', userId: 'user-1', agentId: 'financial-assistant' });
      mockMemory.getMessagesForProvider.mockResolvedValue([
        { role: 'system', content: 'You are a test agent' },
        { role: 'user', content: 'What is my balance?' },
      ]);
      mockToolManager.getTool.mockReturnValue({
        name: 'getAccounts',
        confirmationRequired: false,
        riskLevel: 'read',
        permission: 'read',
        userScoping: true,
      });
      mockToolManager.executeTool.mockResolvedValue({ data: [{ id: 'acc1', balance: 1000 }] });
      mockPrisma.aIAgentExecution.create.mockResolvedValue({ id: 'exec-1' });

      const result = await service.chat({ message: 'What is my balance?' }, 'user-1');

      expect(result.content).toContain('Here are your accounts');
      expect(result.conversationId).toBe('conv-1');
      expect(result.isComplete).toBe(true);
      expect(result.toolExecutions.length).toBeGreaterThan(0);
    });

    it('should pause for confirmation on mutation tools', async () => {
      const mockAdapter = {
        chat: jest.fn()
          .mockResolvedValueOnce({
            content: '',
            toolCalls: [{ id: 'call-1', toolName: 'createTransfer', arguments: { amount: 5000 } }],
            usage: { promptTokens: 50, completionTokens: 30, totalTokens: 80, provider: 'mock' },
            provider: 'mock',
            model: 'gpt-4o-mini',
            requestId: 'req-1',
          })
          .mockResolvedValueOnce({
            content: 'I need confirmation for that transfer.',
            toolCalls: [],
            usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15, provider: 'mock' },
            provider: 'mock',
            model: 'gpt-4o-mini',
            requestId: 'req-1',
          }),
        providerName: 'mock',
        model: 'gpt-4o-mini',
      };

      mockGateway.getAdapter.mockReturnValue(mockAdapter);
      mockRegistry.getDefaultAgent.mockReturnValue({
        ...mockAgent,
        allowedTools: ['createTransfer'],
      });
      mockMemory.getOrCreateConversation.mockResolvedValue({ id: 'conv-2', userId: 'user-1', agentId: 'financial-assistant' });
      mockMemory.getMessagesForProvider.mockResolvedValue([{ role: 'system', content: 'test' }]);
      mockToolManager.getTool.mockReturnValue({
        name: 'createTransfer',
        confirmationRequired: true,
        riskLevel: 'action_high',
        permission: 'action',
        userScoping: true,
      });
      mockToolManager.getAllowedTools.mockReturnValue([
        { name: 'createTransfer', confirmationRequired: true, riskLevel: 'action_high' },
      ]);
      mockPrisma.aIAgentExecution.create.mockResolvedValue({ id: 'exec-2' });

      const result = await service.chat({ message: 'Transfer 5000 to account B' }, 'user-1');

      expect(result.pendingConfirmations.length).toBe(1);
      expect(result.pendingConfirmations[0].toolName).toBe('createTransfer');
    });

    it('should throw NotFoundException when no agent is available', async () => {
      mockRegistry.getDefaultAgent.mockReturnValue(undefined);
      await expect(service.chat({ message: 'Hello' }, 'user-1')).rejects.toThrow();
    });
  });

  describe('confirmTool', () => {
    it('should execute confirmed tool and return result', async () => {
      const mockAgent = {
        id: 'financial-assistant',
        name: 'Test Agent',
        version: '1.0.0',
        modelConfig: { provider: 'mock', model: 'gpt-4o-mini', maxTokens: 2048, temperature: 0.1 },
        systemInstructions: { basePrompt: 'test', riskGuidelines: '', confirmationProtocol: '' },
        allowedTools: [],
      };

      mockPrisma.aIConversation.findFirst.mockResolvedValue({
        id: 'conv-1',
        userId: 'user-1',
        agentId: 'financial-assistant',
      });
      mockRegistry.getAgent.mockReturnValue(mockAgent);
      mockMemory.getPendingToolCall.mockResolvedValue({
        id: 'tool-exec-1',
        toolName: 'createTransfer',
        arguments: { amount: 5000, sourceAccountId: 'a', destinationAccountId: 'b' },
        confirmationState: 'pending',
      });
      mockMemory.updateToolConfirmation.mockResolvedValue(undefined);
      mockMemory.getMessagesForProvider.mockResolvedValue([{ role: 'system', content: 'test' }]);

      const mockAdapter = {
        chat: jest.fn().mockResolvedValue({
          content: 'Transfer completed successfully',
          toolCalls: [],
          usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15, provider: 'mock' },
          provider: 'mock',
          model: 'gpt-4o-mini',
          requestId: 'req-1',
        }),
        providerName: 'mock',
        model: 'gpt-4o-mini',
      };

      mockGateway.getAdapter.mockReturnValue(mockAdapter);

      const result = await service.confirmTool('conv-1', 'tool-exec-1', 'user-1', true);

      expect(result.content).toBe('Transfer completed successfully');
      expect(result.isComplete).toBe(true);
    });

    it('should cancel tool when not confirmed', async () => {
      mockPrisma.aIConversation.findFirst.mockResolvedValue({
        id: 'conv-1',
        userId: 'user-1',
        agentId: 'financial-assistant',
      });
      mockRegistry.getAgent.mockReturnValue({
        id: 'financial-assistant',
        name: 'Test',
        version: '1.0',
        modelConfig: { provider: 'mock', model: 'gpt-4o', maxTokens: 2048, temperature: 0.1 },
        systemInstructions: { basePrompt: 'test', riskGuidelines: '', confirmationProtocol: '' },
        allowedTools: [],
      });

      const result = await service.confirmTool('conv-1', 'tool-exec-1', 'user-1', false);

      expect(result.content).toBe('عملیات لغو شد.');
      expect(result.isComplete).toBe(true);
    });
  });
});
