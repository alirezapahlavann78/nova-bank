import { Module } from '@nestjs/common';
import { ConversationMemoryService } from './conversation-memory.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [ConversationMemoryService, PrismaService],
  exports: [ConversationMemoryService],
})
export class MemoryModule {}
