import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfig: NestConfigService) {}

  get(key: string, defaultValue?: any): any {
    return this.nestConfig.get(key, defaultValue);
  }
}
