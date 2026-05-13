import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AutoTagRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  public readonly title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  public readonly content?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  public readonly extraKeywords?: string[];
}
