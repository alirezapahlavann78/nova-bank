import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentSession {
  id: string;
  userId: string;
}

export const CurrentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentSession => {
    const request = ctx.switchToHttp().getRequest();
    return request.session as CurrentSession;
  },
);
