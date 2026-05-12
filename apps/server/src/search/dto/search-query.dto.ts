import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  public q?: string;
}
