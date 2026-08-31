import { AIToolRiskLevel, AISystemInstructions, AIAgentCapability } from '@nova-bank/types';

export interface ToolRegistration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (context: ToolExecutionContext, args: Record<string, any>) => Promise<ToolExecutionResult>;
  riskLevel: AIToolRiskLevel;
  confirmationRequired: boolean;
  permission: string;
  userScoping: boolean;
}

export interface ToolExecutionContext {
  userId: string;
  requestId: string;
  logger: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
}

export interface ToolExecutionResult {
  data: any;
  confirmationRequired?: boolean;
  error?: string;
}
