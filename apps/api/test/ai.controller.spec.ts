import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { AiController } from '../src/ai/ai.controller';
import { AiService } from '../src/ai/ai.service';
import { ExecutionContext } from '@nestjs/common';

describe('AiController', () => {
  let controller: AiController;
  let aiService: jest.Mocked<AiService>;

  beforeEach(async () => {
    const mockService = {
      chat: jest.fn(),
      confirmTool: jest.fn(),
      getConversations: jest.fn(),
      getConversation: jest.fn(),
      getAvailableAgents: jest.fn(),
      getGatewayHealth: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'user-1', sessionId: 'session-1' };
          return true;
        },
      })
      .compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get(AiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat', () => {
    it('should call aiService.chat with user id from JWT context', async () => {
      const mockResult = {
        content: 'Hello from AI',
        conversationId: 'conv-1',
        agent: { id: 'financial-assistant', name: 'Assistant', version: '1.0.0' },
        toolExecutions: [],
        pendingConfirmations: [],
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15, provider: 'mock' },
        isComplete: true,
      };
      aiService.chat.mockResolvedValue(mockResult);

      const req: any = { user: { id: 'user-1' } };
      const result = await controller.chat(req, { message: 'What is my balance?' });

      expect(aiService.chat).toHaveBeenCalledWith(
        { message: 'What is my balance?' },
        'user-1',
      );
      expect(result).toEqual(mockResult);
    });

    it('should pass conversationId and agentId when provided', async () => {
      aiService.chat.mockResolvedValue({} as any);

      const req: any = { user: { id: 'user-2' } };
      await controller.chat(req, { message: 'Hello', conversationId: 'conv-abc', agentId: 'agent-abc' });

      expect(aiService.chat).toHaveBeenCalledWith(
        { message: 'Hello', conversationId: 'conv-abc', agentId: 'agent-abc' },
        'user-2',
      );
    });
  });

  describe('confirm', () => {
    it('should call aiService.confirmTool with confirmed=true', async () => {
      aiService.confirmTool.mockResolvedValue({} as any);

      const req: any = { user: { id: 'user-1' } };
      await controller.confirm(req, { toolCallId: 'call-1', conversationId: 'conv-1', confirmed: true });

      expect(aiService.confirmTool).toHaveBeenCalledWith('conv-1', 'call-1', 'user-1', true);
    });
  });

  describe('getConversations', () => {
    it('should return conversations for authenticated user', async () => {
      const mockConversations = [{ id: 'conv-1', agentId: 'financial-assistant' }];
      aiService.getConversations.mockResolvedValue(mockConversations);

      const req: any = { user: { id: 'user-1' } };
      const result = await controller.getConversations(req);

      expect(aiService.getConversations).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockConversations);
    });
  });

  describe('getAgents', () => {
    it('should return available agents', async () => {
      const mockAgents = [{ id: 'financial-assistant', name: 'AI Assistant' }];
      aiService.getAvailableAgents.mockResolvedValue(mockAgents);

      const result = await controller.getAgents();

      expect(aiService.getAvailableAgents).toHaveBeenCalled();
      expect(result).toEqual(mockAgents);
    });
  });
});
