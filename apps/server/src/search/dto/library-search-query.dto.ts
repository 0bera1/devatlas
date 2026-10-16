import { Type } from 'class-transformer';
import { IsDate, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class LibrarySearchQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  public readonly q?: string;

  @IsOptional()
  @IsIn(['all', 'document', 'diagram'])
  public readonly type?: 'all' | 'document' | 'diagram';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  public readonly categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  public readonly tag?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public readonly from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public readonly to?: Date;

  @IsOptional()
  @IsIn(['relevance', 'recent'])
  public readonly sort?: 'relevance' | 'recent';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  public readonly limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  public readonly offset?: number;
}
