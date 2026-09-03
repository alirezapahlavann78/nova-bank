import { Injectable } from '@nestjs/common';
import { AIAgentMetadata, AIMessageRole, AISystemInstructions, AIAgentCapability } from '@nova-bank/types';

@Injectable()
export class FinancialAssistantAgent {
  static readonly definition: {
    id: string;
    name: string;
    description: string;
    version: string;
    modelConfig: AIAgentMetadata['modelConfig'];
    systemInstructions: AISystemInstructions;
    capabilities: AIAgentCapability[];
    allowedTools: string[];
  } = {
    id: 'financial-assistant',
    name: 'دستیار مالی نوابانک',
    description: 'Financial assistant that answers read-only queries about accounts, budgets, goals, transactions, reports, and investment portfolios using secure tools.',
    version: '1.0.0',
    modelConfig: {
      provider: 'mock',
      model: 'gpt-4o-mini',
      maxTokens: 2048,
      temperature: 0.1,
    },
    systemInstructions: {
      basePrompt: `You are نوابانک's AI Financial Assistant. You answer user questions about their financial data by calling tools.

CORE PRINCIPLE: You must NEVER directly access the database. Always use the provided tools.

ALL financial data queries are scoped to the authenticated user. The user ID comes from the trusted application context (JWT), NOT from user messages.

Your behavior:
1. Answer read-only queries using read tools (getAccounts, getTransactions, getBudgets, getGoals, getReports, etc.)
2. For financial mutations (createTransfer, createBudget, createGoal, markNotificationRead), ALWAYS ask for confirmation before executing.
3. Never ask the user for their user ID, account ID, or any authentication parameters.
4. If you don't know which tool to call, use getAccounts first to understand the user's accounts.
5. For investment queries, use getInvestmentAccounts, getPortfolio, getHoldings, or getWatchlists.
6. Answers should be in Persian (Farsi).

CONFIRMATION FORMAT: When a mutation tool is needed, output a confirmation request in this exact format:
[CONFIRMATION] toolName=createTransfer args={...} message=می‌خواهید ۵,۰۰۰,۰۰۰ تومان منتقل کنید؟
The user must confirm before the tool executes.

READ-ONLY GUIDELINES:
5. You may also freely call investment read tools (getInvestmentAccounts, getPortfolio, getHoldings, getInvestmentTransactions, getPortfolioPerformance, getAssetAllocation, getWatchlists, getInvestmentGoals)
6. Read tools do NOT require confirmation
7. Read tools always execute immediately

RISK LEVELS:
- READ tools: execute immediately, no confirmation needed
- ACTION_LOW tools: require confirmation
- ACTION_HIGH tools: require explicit confirmation + additional validation`,
      riskGuidelines: `All mutation tools require explicit user confirmation via the confirmation flow.
The confirmation must include the exact parameters the tool will be called with.
Never execute a mutation tool without a confirmed user response.
Read-only tools (getAccounts, getTransactions, getBudgets, getGoals, getReports, getNotifications, getTransactionSummary, getInvestmentAccounts, getPortfolio, getHoldings, getInvestmentTransactions, getPortfolioPerformance, getAssetAllocation, getWatchlists, getInvestmentGoals) execute immediately.`,
      confirmationProtocol: `1. Agent identifies a mutation tool is needed
2. Agent outputs a confirmation request with tool name and arguments
3. User confirms or cancels
4. If confirmed, the tool executes with the confirmed arguments
5. If cancelled, the tool is not executed
Available states: PENDING_CONFIRMATION → CONFIRMED → EXECUTED, or PENDING_CONFIRMATION → CANCELLED`,
    },
    capabilities: [
      {
        name: 'financial-read',
        description: 'Read financial data: accounts, transactions, budgets, goals, reports',
        tools: [
          'getAccounts',
          'getAccountBalance',
          'getTransactions',
          'getTransactionSummary',
          'getBudgets',
          'getGoals',
          'getNotifications',
          'getReports',
        ],
      },
      {
        name: 'investment-read',
        description: 'Read investment data: portfolio, holdings, transactions, watchlists, goals',
        tools: [
          'getInvestmentAccounts',
          'getPortfolio',
          'getHoldings',
          'getInvestmentTransactions',
          'getPortfolioPerformance',
          'getAssetAllocation',
          'getWatchlists',
          'getInvestmentGoals',
        ],
      },
      {
        name: 'financial-action',
        description: 'Perform financial actions with confirmation',
        tools: ['createTransfer', 'createBudget', 'createGoal', 'markNotificationRead'],
      },
    ],
    allowedTools: [
      'getAccounts',
      'getAccountBalance',
      'getTransactions',
      'getTransactionSummary',
      'getBudgets',
      'getGoals',
      'getNotifications',
      'getReports',
      'getInvestmentAccounts',
      'getPortfolio',
      'getHoldings',
      'getInvestmentTransactions',
      'getPortfolioPerformance',
      'getAssetAllocation',
      'getWatchlists',
      'getInvestmentGoals',
      'createTransfer',
      'createBudget',
      'createGoal',
      'markNotificationRead',
    ],
  };
}
