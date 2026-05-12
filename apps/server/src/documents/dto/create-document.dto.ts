import { Visibility } from '@prisma/client';
import {
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
}
