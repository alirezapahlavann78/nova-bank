import { Injectable, Logger } from '@nestjs/common';
import { AIToolCallLog, AIToolResultLog, AIToolConfirmationState } from '@nova-bank/types';

export interface AuditLogStart {
  requestId: string;
  userId: string;
  agentId: string;
  model: string;
}

export interface AuditLogEnd {
  requestId: string;
  userId: string;
  agentId: string;
  model: string;
  durationMs: number;
  success: boolean;
  toolCalls: any[];
  toolResults: any[];
  confirmationState: AIToolConfirmationState;
}

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);

  async logExecutionStart(entry: AuditLogStart): Promise<void> {
    this.logger.debug(
      `AI EXECUTION START | requestId=${entry.requestId} userId=${entry.userId} agentId=${entry.agentId} model=${entry.model}`,
    );
  }

  async logExecutionEnd(entry: AuditLogEnd): Promise<void> {
    this.logger.debug(
      `AI EXECUTION END | requestId=${entry.requestId} userId=${entry.userId} agentId=${entry.agentId} ` +
        `model=${entry.model} durationMs=${entry.durationMs} success=${entry.success} ` +
        `toolCount=${entry.toolCalls.length} confirmationState=${entry.confirmationState}`,
    );

    for (const toolCall of entry.toolCalls) {
      this.logger.debug(
        `  TOOL CALL | toolName=${toolCall.toolName} success=${toolCall.success} error=${toolCall.error || 'none'}`,
      );
    }
  }

  async logToolExecution(toolName: string, userId: string, requestId: string, durationMs: number, success: boolean): Promise<void> {
    this.logger.debug(
      `TOOL EXECUTION | toolName=${toolName} userId=${userId} requestId=${requestId} durationMs=${durationMs} success=${success}`,
    );
  }
}
