-- CreateEnum
CREATE TYPE "AIMessageRole" AS ENUM ('SYSTEM', 'USER', 'ASSISTANT', 'TOOL');

-- CreateEnum
CREATE TYPE "AIAgentExecutionStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AIToolExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AIToolConfirmationState" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AIToolRiskLevel" AS ENUM ('READ', 'ACTION_LOW', 'ACTION_HIGH');

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "title" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AIMessageRole" NOT NULL,
    "content" TEXT,
    "toolCalls" JSONB,
    "toolResults" JSONB,
    "tokenUsage" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAgentExecution" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" "AIAgentExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "inputTokens" INTEGER DEFAULT 0,
    "outputTokens" INTEGER DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "AIAgentExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIToolExecution" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "riskLevel" "AIToolRiskLevel" NOT NULL,
    "status" "AIToolExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "input" JSONB,
    "output" JSONB,
    "durationMs" INTEGER,
    "confirmationState" "AIToolConfirmationState" NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "AIToolExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIConversation_userId_idx" ON "AIConversation"("userId");

-- CreateIndex
CREATE INDEX "AIConversation_userId_isActive_idx" ON "AIConversation"("userId", "isActive");

-- CreateIndex
CREATE INDEX "AIConversation_userId_startedAt_idx" ON "AIConversation"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "AIConversation_agentId_idx" ON "AIConversation"("agentId");

-- CreateIndex
CREATE INDEX "AIMessage_conversationId_idx" ON "AIMessage"("conversationId");

-- CreateIndex
CREATE INDEX "AIMessage_conversationId_createdAt_idx" ON "AIMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "AIAgentExecution_conversationId_idx" ON "AIAgentExecution"("conversationId");

-- CreateIndex
CREATE INDEX "AIAgentExecution_agentId_idx" ON "AIAgentExecution"("agentId");

-- CreateIndex
CREATE INDEX "AIAgentExecution_status_idx" ON "AIAgentExecution"("status");

-- CreateIndex
CREATE INDEX "AIToolExecution_executionId_idx" ON "AIToolExecution"("executionId");

-- CreateIndex
CREATE INDEX "AIToolExecution_toolName_idx" ON "AIToolExecution"("toolName");

-- CreateIndex
CREATE INDEX "AIToolExecution_confirmationState_idx" ON "AIToolExecution"("confirmationState");

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAgentExecution" ADD CONSTRAINT "AIAgentExecution_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIToolExecution" ADD CONSTRAINT "AIToolExecution_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "AIAgentExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
