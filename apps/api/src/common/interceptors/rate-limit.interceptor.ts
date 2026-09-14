import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface RateLimitOptions {
  points: number;
  duration: number;
}

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly store = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly options: RateLimitOptions = { points: 5, duration: 60000 }) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const key = this.getKey(req);
    const now = Date.now();
    const { points, duration } = this.options;
    const record = this.store.get(key);

    if (record && now < record.resetAt) {
      if (record.count > points) {
        const res = context.switchToHttp().getResponse();
        res.status(429);
        throw new HttpException(
          'تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کمی بعد دوباره تلاش کنید.',
          429,
        );
      }
    } else {
      this.store.set(key, { count: 0, resetAt: now + duration });
    }

    return next.handle().pipe(
      // Only successful requests consume the rate-limit budget;
      // failed attempts (validation 400, wrong credentials 401) don't.
      tap(() => {
        const current = this.store.get(key);
        if (current && Date.now() < current.resetAt) {
          current.count++;
        }
      }),
      catchError((err) => {
        // Repeated client errors still count, so brute-force is limited,
        // but a single validation mistake never locks the user out.
        if (err instanceof HttpException && err.getStatus() === 401) {
          const current = this.store.get(key);
          if (current && Date.now() < current.resetAt) {
            current.count += 3; // weight failed logins heavier
          }
        }
        return throwError(() => err);
      }),
    );
  }

  private getKey(req: any): string {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
}
