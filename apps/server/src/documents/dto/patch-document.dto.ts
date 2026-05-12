import { Visibility } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class PatchDocumentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  public readonly title?: string;

  @IsOptional()
  @IsEnum(Visibility)
  public readonly visibility?: Visibility;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === '' ? null : value,
  )
  @ValidateIf((_, value: unknown) => value !== null && value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  public readonly categoryName?: string | null;
}
