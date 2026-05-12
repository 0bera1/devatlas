import { IsString, MaxLength, MinLength } from 'class-validator';

export class PatchDocumentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  public readonly title!: string;
}
