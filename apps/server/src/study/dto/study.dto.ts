import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { ReviewRating } from '../spaced-repetition';

export class DueQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  public readonly limit?: number;
}

export class ReviewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  public readonly questionId!: string;

  /** 0 = Tekrar, 1 = Zor, 2 = İyi, 3 = Kolay. */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3)
  public readonly rating!: ReviewRating;
}

export class CreateStudyListDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  public readonly name!: string;
}

export class AddStudyItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  public readonly questionId!: string;
}
