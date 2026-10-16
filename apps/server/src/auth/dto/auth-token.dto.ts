import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @MinLength(20)
  @MaxLength(200)
  public readonly token!: string;
}

export class ResendVerificationDto {
  @IsEmail()
  public readonly email!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  public readonly email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(20)
  @MaxLength(200)
  public readonly token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  public readonly password!: string;
}
