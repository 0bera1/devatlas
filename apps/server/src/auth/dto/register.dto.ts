import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** class-transformer: trim; boş / yalnızca boşluk sonrası `''` olur, ardından @IsNotEmpty devreye girer. */
function TransformTrimToEmptyString(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }): unknown =>
    typeof value === 'string' ? value.trim() : value,
  );
}

export class RegisterDto {
  @IsEmail()
  public readonly email!: string;

  @IsString()
  @MinLength(8)
  public readonly password!: string;

  @IsString()
  @TransformTrimToEmptyString()
  @IsNotEmpty({ message: 'firstName is required' })
  @MaxLength(80)
  public readonly firstName!: string;

  @IsString()
  @TransformTrimToEmptyString()
  @IsNotEmpty({ message: 'lastName is required' })
  @MaxLength(80)
  public readonly lastName!: string;

  @Type(() => Date)
  @IsDate()
  public readonly birthDate!: Date;
}
