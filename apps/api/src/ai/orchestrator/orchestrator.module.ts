import { Module } from '@nestjs/common';
import { AgentOrchestratorService } from './agent-orchestrator.service';
import { AIGatewayModule } from '../gateway/ai-gateway.module';
import { AgentRegistryModule } from '../registry/agent-registry.module';
import { ToolManagerModule } from '../tools/tool-manager.module';
import { MemoryModule } from '../memory/memory.module';
import { AuditLogModule } from '../logging/audit-log.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [
    AIGatewayModule,
    AgentRegistryModule,
    ToolManagerModule,
    MemoryModule,
    AuditLogModule,
  ],
  providers: [AgentOrchestratorService, PrismaService],
  exports: [AgentOrchestratorService],
})
export class OrchestratorModule {}
