import { Controller, Post, Body, UseGuards, Request, Get, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { ChatRequestDto, ConfirmationRequestDto } from './dto/chat-request.dto';
import { chatRequestSchema, confirmationRequestSchema } from '@nova-bank/validation';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AIChatResponse } from '@nova-bank/types';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Request() req: any,
    @Body(new ZodValidationPipe(chatRequestSchema)) body: ChatRequestDto,
  ): Promise<AIChatResponse> {
    return this.aiService.chat(
      {
        message: body.message,
        conversationId: body.conversationId,
        agentId: body.agentId,
      },
      req.user.id,
    );
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirm(
    @Request() req: any,
    @Body(new ZodValidationPipe(confirmationRequestSchema)) body: ConfirmationRequestDto,
  ): Promise<AIChatResponse> {
    if (!body.conversationId) {
      throw new Error('conversationId is required for confirmation');
    }
    return this.aiService.confirmTool(body.conversationId, body.toolCallId, req.user.id, body.confirmed);
  }

  @Get('conversations')
  async getConversations(@Request() req: any): Promise<any[]> {
    return this.aiService.getConversations(req.user.id);
  }

  @Get('conversations/:id')
  async getConversation(@Request() req: any, @Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return this.aiService.getConversation(id, req.user.id);
  }

  @Get('agents')
  async getAgents(): Promise<any[]> {
    return this.aiService.getAvailableAgents();
  }

  @Get('health')
  async getHealth(): Promise<{ provider: string; model: string; available: boolean }> {
    return this.aiService.getGatewayHealth();
  }
}
