import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  public readonly email!: string;

  @IsString()
  @MinLength(1)
  public readonly password!: string;
}
