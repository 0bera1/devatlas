import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

function TransformTrimToEmptyString(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  );
}

export class UpdateProfileDto {
  @IsOptional()
  @TransformTrimToEmptyString()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  public readonly firstName?: string;

  @IsOptional()
  @TransformTrimToEmptyString()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  public readonly lastName?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public readonly birthDate?: Date;
}
