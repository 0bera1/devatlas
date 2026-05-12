import { IsString, MaxLength } from 'class-validator';

export class UpdateDocumentDto {
  @IsString()
  @MaxLength(1_000_000)
  public readonly content!: string;
}
