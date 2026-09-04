-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('BILL_PAYMENT', 'TOP_UP', 'DOMESTIC_TRANSFER', 'MOBILE_TOPUP', 'CHARITY', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED');

-- CreateEnum
CREATE TYPE "PaymentDestinationType" AS ENUM ('ACCOUNT', 'CARD', 'MOBILE', 'BILL', 'CHARITY');

-- CreateEnum
CREATE TYPE "ScheduledPaymentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "destinationType" "PaymentDestinationType" NOT NULL,
    "destinationValue" TEXT NOT NULL,
    "bankCode" TEXT,
    "bankName" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" INTEGER,
    "sourceAccountId" TEXT,
    "destinationType" "PaymentDestinationType" NOT NULL,
    "destinationValue" TEXT NOT NULL,
    "beneficiaryId" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'IRT',
    "sourceAccountId" TEXT NOT NULL,
    "destinationType" "PaymentDestinationType" NOT NULL,
    "destinationValue" TEXT NOT NULL,
    "destinationName" TEXT,
    "description" TEXT,
    "fees" INTEGER NOT NULL DEFAULT 0,
    "reference" TEXT,
    "internalReference" TEXT,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "executedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "type" "PaymentType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'IRT',
    "sourceAccountId" TEXT NOT NULL,
    "destinationType" "PaymentDestinationType" NOT NULL,
    "destinationValue" TEXT NOT NULL,
    "status" "ScheduledPaymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "frequency" "RecurringFrequency" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3) NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "maxRuns" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentExecution" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentId" TEXT,
    "scheduledPaymentId" TEXT,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "externalReference" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "requestHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "response" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");

-- CreateIndex
CREATE INDEX "IdempotencyKey_userId_idx" ON "IdempotencyKey"("userId");

-- CreateIndex
CREATE INDEX "IdempotencyKey_expiresAt_idx" ON "IdempotencyKey"("expiresAt");

-- CreateIndex
CREATE INDEX "Beneficiary_userId_idx" ON "Beneficiary"("userId");

-- CreateIndex
CREATE INDEX "Beneficiary_userId_destinationType_idx" ON "Beneficiary"("userId", "destinationType");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_userId_destinationValue_destinationType_key" ON "Beneficiary"("userId", "destinationValue", "destinationType");

-- CreateIndex
CREATE INDEX "PaymentTemplate_userId_idx" ON "PaymentTemplate"("userId");

-- CreateIndex
CREATE INDEX "PaymentTemplate_userId_isActive_idx" ON "PaymentTemplate"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_userId_status_idx" ON "Payment"("userId", "status");

-- CreateIndex
CREATE INDEX "Payment_userId_type_idx" ON "Payment"("userId", "type");

-- CreateIndex
CREATE INDEX "Payment_userId_createdAt_idx" ON "Payment"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_internalReference_key" ON "Payment"("internalReference");

-- CreateIndex
CREATE INDEX "ScheduledPayment_userId_idx" ON "ScheduledPayment"("userId");

-- CreateIndex
CREATE INDEX "ScheduledPayment_userId_status_idx" ON "ScheduledPayment"("userId", "status");

-- CreateIndex
CREATE INDEX "ScheduledPayment_userId_nextRunAt_idx" ON "ScheduledPayment"("userId", "nextRunAt");

-- CreateIndex
CREATE INDEX "PaymentExecution_userId_idx" ON "PaymentExecution"("userId");

-- CreateIndex
CREATE INDEX "PaymentExecution_paymentId_idx" ON "PaymentExecution"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentExecution_scheduledPaymentId_idx" ON "PaymentExecution"("scheduledPaymentId");

-- CreateIndex
CREATE INDEX "PaymentExecution_status_idx" ON "PaymentExecution"("status");

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTemplate" ADD CONSTRAINT "PaymentTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTemplate" ADD CONSTRAINT "PaymentTemplate_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPayment" ADD CONSTRAINT "ScheduledPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledPayment" ADD CONSTRAINT "ScheduledPayment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PaymentTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentExecution" ADD CONSTRAINT "PaymentExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentExecution" ADD CONSTRAINT "PaymentExecution_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentExecution" ADD CONSTRAINT "PaymentExecution_scheduledPaymentId_fkey" FOREIGN KEY ("scheduledPaymentId") REFERENCES "ScheduledPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "PaymentAudit" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestId" TEXT,
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentAudit_paymentId_idx" ON "PaymentAudit"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentAudit_userId_idx" ON "PaymentAudit"("userId");

-- CreateIndex
CREATE INDEX "PaymentAudit_userId_createdAt_idx" ON "PaymentAudit"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "PaymentAudit" ADD CONSTRAINT "PaymentAudit_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAudit" ADD CONSTRAINT "PaymentAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAudit" ADD CONSTRAINT "PaymentAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "NotificationPreference" ADD COLUMN "paymentAlerts" BOOLEAN NOT NULL DEFAULT false;
