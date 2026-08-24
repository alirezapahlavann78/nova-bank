import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface RateLimitOptions {
  points: number;
  duration: number;
}

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly store = new Map<string, { count: number; resetAt: number }>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const key = this.getKey(req);
    const now = Date.now();
    const record = this.store.get(key);

    if (record && now < record.resetAt) {
      record.count++;
      if (record.count > 5) {
        throw new ForbiddenException('Too many requests. Please try again later.');
      }
    } else {
      this.store.set(key, { count: 1, resetAt: now + 60000 });
    }

    return next.handle();
  }

  private getKey(req: any): string {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
}
