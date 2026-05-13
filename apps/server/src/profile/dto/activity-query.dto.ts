import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class ActivityQueryDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public readonly from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public readonly to?: Date;
}
