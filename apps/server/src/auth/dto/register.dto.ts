import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  public readonly email!: string;

  @IsString()
  @MinLength(8)
  public readonly password!: string;

  @IsOptional()
  @IsString()
  public readonly name?: string;

  @Type(() => Date)
  @IsDate()
  public readonly birthDate!: Date;
}
