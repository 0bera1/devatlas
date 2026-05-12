import { IsEmail, MaxLength } from 'class-validator';

export class AddDiagramCollaboratorDto {
  @IsEmail()
  @MaxLength(320)
  public readonly email!: string;
}
