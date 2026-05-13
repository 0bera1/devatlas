import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  public readonly currentPassword!: string;

  @IsString()
  @MinLength(8)
  public readonly newPassword!: string;
}
