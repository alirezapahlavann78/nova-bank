import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: any, _metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: error.errors?.map((e: any) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }
  }
}
