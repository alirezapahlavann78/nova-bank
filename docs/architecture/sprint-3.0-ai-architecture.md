# Sprint 3.0 — AI Platform Architecture

## Overview

Sprint 3.0 introduces the **Nova Bank AI Platform** — an AI-powered financial assistant that enables users to query their financial data through natural language (Persian/English) while enforcing strict security boundaries.

The AI system follows a layered architecture:

```
Client (Mobile/Web)
  → AI Controller (REST API)
    → Agent Orchestrator
      → Agent Registry (agent discovery)
      → AI Gateway (provider abstraction)
      → Tool Manager (secure tool execution)
        → Existing Application Services
          → Prisma → PostgreSQL
```

**Key Principle**: AI agents NEVER access the database directly. All data access flows through registered tools that call existing application services.

---

## Architecture Layers

### 1. AI Gateway

**Location**: `apps/api/src/ai/gateway/`

The AI Gateway provides model and provider abstraction. The rest of the application never depends on a specific AI provider.

**Components**:
- `AIGatewayService` — Central entry point. Initializes the appropriate provider adapter based on configuration.
- `ProviderAdapter` (interface) — Abstract adapter interface with `chat()` and `isAvailable()` methods.
- `HttpProviderAdapter` — HTTP-based adapter for OpenAI-compatible providers. Uses `fetch` directly (no SDK dependency). Handles timeouts, retries (exponential backoff), error normalization, and request IDs.
- `MockProviderAdapter` — Local mock provider for development and testing. Returns keyword-based tool call suggestions.

**Configuration** (via `ConfigService`):
- `AI_GATEWAY_ENABLED` — Master switch for the AI platform
- `AI_PROVIDER` — Provider identifier (e.g., "openai", "mock")
- `AI_PROVIDER_API_KEY` — API key for the provider
- `AI_DEFAULT_MODEL` — Default model name
- `AI_MAX_TOKENS` — Token limit
- `AI_TIMEOUT_MS` — Request timeout (default: 30000ms)
- `AI_MAX_RETRIES` — Maximum retry attempts (default: 3)

**Provider Selection Logic**:
1. If `AI_GATEWAY_ENABLED=false` → use MockProviderAdapter
2. If API key is missing → use MockProviderAdapter with warning
3. Otherwise → use HttpProviderAdapter

### 2. Agent Registry

**Location**: `apps/api/src/ai/registry/`

The Agent Registry manages AI agents — their discovery, metadata, and configuration.

**Components**:
- `AgentRegistryService` — In-memory registry for agent definitions.
- `FinancialAssistantAgent` — The default agent. A read-only financial assistant that supports Persian queries.

**Agent Definition** includes:
- `id`, `name`, `description`, `version`
- `isEnabled` — Toggle for agent availability
- `modelConfig` — Provider, model, maxTokens, temperature
- `systemInstructions` — Base prompt, risk guidelines, confirmation protocol
- `capabilities` — Feature groupings with associated tools
- `allowedTools` — Whitelist of tools the agent can call

**Registered Agents** (Sprint 3.0):
| Agent ID | Name | Status |
|---|---|---|
| `financial-assistant` | دستیار مالی نوابانک | Enabled by default |

### 3. Agent Orchestrator

**Location**: `apps/api/src/ai/orchestrator/`

The Agent Orchestrator manages the execution lifecycle of AI agents.

**Flow**:
1. Receive chat request with `message`, optional `conversationId`, optional `agentId`
2. Resolve agent from registry (default: `financial-assistant`)
3. Get or create AI conversation
4. Save user message to memory
5. Enter agent loop:
   a. Load conversation history (including system prompt)
   b. Call AI Gateway adapter
   c. If response has no tool calls → complete
   d. For each tool call:
      - **Read tools** (risk: `read`): Execute immediately, feed result back to LLM
      - **Action tools** (risk: `action_low` or `action_high`): Require user confirmation
   e. If mutation tools are called → pause and return pending confirmations
   f. If confirmed via `/ai/confirm` → execute tool, resume loop
6. Record execution in database and audit log
7. Return normalized response

**Confirmation Flow**:
```
AI → toolCall (confirmationRequired: true)
  → PENDING_CONFIRMATION (paused)
    → User confirms via POST /ai/confirm
      → CONFIRMED → tool executes → EXECUTED
    → User cancels
      → CANCELLED
```

### 4. Tool Manager

**Location**: `apps/api/src/ai/tools/`

The Tool Manager is the **security boundary** between AI agents and application data. Every AI action flows through a registered tool.

**Security Model**:
- Each tool defines: `permission`, `riskLevel`, `confirmationRequired`, `userScoping`
- **User identity always comes from JWT context** — never from LLM-generated parameters
- `userId` in tool arguments is rejected with `ForbiddenException`
- Tool Manager injects `userId` from the authenticated request context

**Registered Tools**:

#### Read Tools (execute immediately, no confirmation)
| Tool | Service | Description |
|---|---|---|
| `getAccounts` | `AccountsService.findAll` | List all active accounts |
| `getAccountBalance` | `AccountsService.findOne` | Get balance for a specific account |
| `getTransactions` | `TransactionsService.findAll` | List transactions with filters |
| `getTransactionSummary` | `ReportsService` + `TransactionsService` | Summary of income, expenses, transactions |
| `getBudgets` | `BudgetsService.findAll` | List all budgets with spent/remaining |
| `getGoals` | `GoalsService.findAll` | List all savings goals |
| `getNotifications` | `NotificationsService.findAll` | List recent notifications |
| `getReports` | `ReportsService` | Various report types (summary, income-expense, by-category, overview, trends, category-breakdown, budget-performance, goal-progress) |

#### Action Tools (require confirmation)
| Tool | Service | Risk Level | Description |
|---|---|---|---|
| `createTransfer` | `TransfersService.create` | `action_high` | Internal transfer between accounts |
| `createBudget` | `BudgetsService.create` | `action_low` | Create a new budget |
| `createGoal` | `GoalsService.create` | `action_low` | Create a savings goal |
| `markNotificationRead` | `NotificationsService.markAsRead` | `action_low` | Mark notification as read |

**Input Validation**:
- Required parameters are validated before execution
- Type coercion handled by underlying DTOs (Zod/class-validator)
- Unknown tools return `NotFoundException`

### 5. AI Memory

**Location**: `apps/api/src/ai/memory/`

`ConversationMemoryService` provides persistence for AI conversations.

**Capabilities**:
- `getOrCreateConversation` — Get existing or create new conversation
- `saveMessage` — Store messages (user, assistant, tool)
- `getMessages` / `getMessagesForProvider` — Retrieve conversation history, formatted for the AI provider
- `saveToolCall` — Record tool calls with pending confirmation
- `updateToolConfirmation` — Update confirmation state (confirmed/cancelled)
- `getPendingToolCall` — Retrieve pending confirmation for execution
- `getConversationHistory` — List user conversations
- `getConversationDetail` — Get full conversation with messages, executions, and tool logs

### 6. Audit Logging

**Location**: `apps/api/src/ai/logging/`

`AuditLoggerService` records all AI execution events.

**Logged Fields**:
- Request ID
- User ID (from JWT, not LLM)
- Agent ID
- Model
- Timestamp
- Tool calls (names, arguments)
- Tool results (success/failure, confirmation state)
- Execution duration
- Success/failure state
- Confirmation state

**Never logged**: API keys, provider credentials, user secrets.

### 7. AI Conversation API

**Location**: `apps/api/src/ai/ai.controller.ts`

**Endpoints** (all require JWT authentication):

| Method | Path | Description |
|---|---|---|
| POST | `/ai/chat` | Send a message to the AI agent |
| POST | `/ai/confirm` | Confirm or cancel a pending tool execution |
| GET | `/ai/conversations` | List user conversations |
| GET | `/ai/conversations/:id` | Get conversation details |
| GET | `/ai/agents` | List available agents |
| GET | `/ai/health` | Check AI gateway health |

**POST /ai/chat Request**:
```json
{
  "message": "موجودی حساب‌های من چقدره؟",
  "conversationId": "optional-uuid",
  "agentId": "optional-uuid"
}
```

**POST /ai/chat Response**:
```json
{
  "content": "بالاخره، موجودی حساب شما ۵,۰۰۰,۰۰۰ تومان است.",
  "conversationId": "conv-uuid",
  "agent": { "id": "financial-assistant", "name": "دستیار مالی نوابانک", "version": "1.0.0" },
  "toolExecutions": [{ "toolName": "getAccountBalance", "success": true, "data": {...} }],
  "pendingConfirmations": [],
  "usage": { "promptTokens": 50, "completionTokens": 30, "totalTokens": 80, "provider": "mock" },
  "isComplete": true
}
```

### 8. Mobile AI Assistant

**Location**:
- `apps/mobile/services/ai.ts` — API client functions
- `apps/mobile/stores/aiStore.ts` — Zustand state for conversation
- `apps/mobile/hooks/useAI.ts` — AI conversation hook
- `apps/mobile/app/(tabs)/ai.tsx` — Chat screen
- `apps/mobile/app/(tabs)/_layout.tsx` — Tab navigation with AI tab

**Features**:
- Chat message list with Persian/RTL support
- User and assistant message bubbles
- Tool execution status display
- Pending confirmation approval/disapproval
- Loading state
- Error state
- New conversation button
- Tab navigation (Dashboard + AI Assistant)

**State Management**:
Uses Zustand (`useAIStore`) for conversation state, following the existing pattern from `authStore`.

### 9. Database Models

**Location**: `apps/api/prisma/schema.prisma`

New models added in migration `0.3.0_add_ai_platform`:

| Model | Fields | Indexes |
|---|---|---|
| `AIConversation` | id, userId, agentId, title, startedAt, endedAt, isActive, createdAt, updatedAt | userId, (userId, isActive), (userId, startedAt), agentId |
| `AIMessage` | id, conversationId, role, content, toolCalls, toolResults, tokenUsage, createdAt | conversationId, (conversationId, createdAt) |
| `AIAgentExecution` | id, conversationId, agentId, model, status, startedAt, endedAt, durationMs, inputTokens, outputTokens, error | conversationId, agentId, status |
| `AIToolExecution` | id, executionId, toolName, riskLevel, status, input, output, durationMs, confirmationState, createdAt, confirmedAt | executionId, toolName, confirmationState |

**Enums**:
- `AIMessageRole`: SYSTEM, USER, ASSISTANT, TOOL
- `AIAgentExecutionStatus`: RUNNING, COMPLETED, FAILED, CANCELLED
- `AIToolExecutionStatus`: PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
- `AIToolConfirmationState`: PENDING_CONFIRMATION, CONFIRMED, CANCELLED
- `AIToolRiskLevel`: READ, ACTION_LOW, ACTION_HIGH

**Relations**:
- `User.aiConversations` → `AIConversation[]`
- `AIConversation.messages` → `AIMessage[]`
- `AIConversation.executions` → `AIAgentExecution[]`
- `AIAgentExecution.toolExecutions` → `AIToolExecution[]`

### 10. Threat Model

| Threat | Mitigation |
|---|---|
| AI injects arbitrary `userId` | ToolManager rejects `userId` in tool args; injects from JWT context |
| Cross-user data access | All service calls use `userId` from request context |
| Unauthorized tool access | Agent Registry enforces allowed tool whitelist per agent |
| Unsafe financial mutation | All action tools require explicit user confirmation |
| Direct Prisma access from AI | AI layer never imports Prisma; all data access via ToolManager → Services |
| DATABASE_URL exposure | AI layer never receives DATABASE_URL; config comes from ConfigService |
| Arbitrary SQL execution | No raw SQL; all queries via Prisma Client with parameterized queries |
| Provider credential leakage | Audit logs never store API keys; credentials only in ConfigService |

### 11. Security Enforcement

The security model is enforced at multiple layers:

1. **Authentication**: `JwtAuthGuard` on `AiController` ensures every request is authenticated.
2. **User Identity**: `req.user.id` from JWT is the ONLY source of user identity. This is passed to `ToolManager.executeTool` as `userId`.
3. **Tool Input Sanitization**: `ToolManagerService.sanitizeArgs()` rejects any `userId` parameter in tool arguments and injects the context-derived `userId`.
4. **User Scoping**: Every tool has `userScoping: true`, ensuring the user ID is always injected server-side.
5. **Confirmation Required**: Mutation tools (`createTransfer`, `createBudget`, `createGoal`, `markNotificationRead`) have `confirmationRequired: true` and are never executed without explicit user confirmation.
6. **Tool Whitelist**: The orchestrator only provides tools that are in the agent's `allowedTools` list to the AI gateway.

### 12. Module Wiring

**Changes to existing Sprint 2.x modules** (DI fix, no business logic changes):
- `BudgetsModule`: Added `NotificationsModule` import (BudgetsService depends on NotificationsService)
- `GoalsModule`: Added `NotificationsModule` import (GoalsService depends on NotificationsService)
- `TransactionsModule`: Added `NotificationsModule` and `BudgetsModule` imports (TransactionsService depends on both)
- `TransfersModule`: Added `NotificationsModule` import (TransfersService depends on NotificationsService)
- `AppModule`: Added all feature modules + `AIModule` to imports

### 13. Deferred Functionality

The following are intentionally NOT implemented in Sprint 3.0:

1. **Real AI provider integration** — The HttpProviderAdapter is implemented but requires an API key (`AI_PROVIDER_API_KEY`). Without it, the system falls back to the MockProviderAdapter.
2. **Vector/semantic memory** — The memory system uses a conversation-based approach. Future vector database integration (Pinecone, Weaviate, etc.) can be added without changing the agent architecture.
3. **Multi-agent orchestration** — Currently only `financial-assistant` is registered. The registry supports adding more agents.
4. **Streaming responses** — Chat API returns full responses (non-streaming). Future Sprints may add SSE/streaming.
5. **Advanced prompt engineering** — Basic system prompt is defined. Future Sprints may add prompt templates, few-shot examples, and dynamic prompt generation.
6. **Usage-based billing/tracking** — Token usage is tracked but not billed. Future Sprints may add cost calculation.
7. **AI model fine-tuning** — No model fine-tuning is performed. Future Sprints may add fine-tuning capabilities.
8. **Mobile proactive suggestions** — The mobile app requires user-initiated chat. Future Sprints may add proactive AI suggestions.

---

## File Inventory

### Backend (`apps/api/src/ai/`)
```
ai.module.ts                      — Root AI module
ai.controller.ts                  — REST API endpoints
ai.service.ts                   — Application service (wraps orchestrator)
gateway/
  ai-gateway.module.ts
  ai-gateway.service.ts
  interfaces/provider-adapter.interface.ts
  adapters/http-provider.adapter.ts
  adapters/mock-provider.adapter.ts
registry/
  agent-registry.module.ts
  agent-registry.service.ts
  agents/financial-assistant.agent.ts
tools/
  tool-manager.module.ts
  tool-manager.service.ts
  interfaces/tool-execution-context.interface.ts
orchestrator/
  orchestrator.module.ts
  agent-orchestrator.service.ts
memory/
  memory.module.ts
  conversation-memory.service.ts
logging/
  audit-log.module.ts
  audit-logger.service.ts
dto/
  chat-request.dto.ts
tests/
  test/ai-gateway.service.spec.ts
  test/agent-registry.service.spec.ts
  test/tool-manager.service.spec.ts
  test/agent-orchestrator.service.spec.ts
  test/ai.controller.spec.ts
  test/ai-security.spec.ts
```

### Mobile (`apps/mobile/`)
```
services/ai.ts                    — API client
stores/aiStore.ts                 — Zustand state
hooks/useAI.ts                    — AI conversation hook
app/(tabs)/ai.tsx                 — Chat screen
app/(tabs)/_layout.tsx            — Tab navigation with AI tab
types/ai.ts                       — Mobile AI types
```

### Shared
```
packages/types/src/index.ts       — Added AI type contracts
packages/validation/src/index.ts  — Added AI Zod schemas
apps/api/prisma/schema.prisma     — Added AI models
apps/api/prisma/migrations/0.3.0_add_ai_platform/migration.sql
apps/api/src/common/pipes/zod-validation.pipe.ts
```
