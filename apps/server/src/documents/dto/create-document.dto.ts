import { Visibility } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  public readonly title!: string;

  @IsOptional()
  @IsEnum(Visibility)
  public readonly visibility?: Visibility;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(64, { each: true })
  public readonly tags?: string[];

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  public readonly categoryName?: string;
}
