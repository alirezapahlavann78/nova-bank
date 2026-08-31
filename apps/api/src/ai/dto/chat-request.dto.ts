import { IsString, IsOptional, IsUUID, IsBoolean, Min } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @Min(1)
  message!: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsOptional()
  @IsUUID()
  agentId?: string;
}

export class ConfirmationRequestDto {
  @IsString()
  toolCallId!: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsBoolean()
  confirmed!: boolean;
}
