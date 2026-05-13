import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  /**
   * `null` ⇒ ismi temizle; verilmemişse alan değişmez. Boş string'i kabul
   * etmiyoruz (kullanıcı boşa düşürmek istiyorsa açıkça `null` göndermeli).
   */
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  public readonly name?: string | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  public readonly birthDate?: Date;
}
