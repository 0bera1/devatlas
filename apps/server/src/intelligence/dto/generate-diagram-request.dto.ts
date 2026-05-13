import { IsString, MaxLength, MinLength } from 'class-validator';
import {
  ARCHITECTURE_TEMPLATE_MAX_PROMPT_LENGTH,
  ARCHITECTURE_TEMPLATE_MIN_PROMPT_LENGTH,
} from '../diagram-generation/architecture-templates.constant';

export class GenerateDiagramRequestDto {
  @IsString()
  @MinLength(ARCHITECTURE_TEMPLATE_MIN_PROMPT_LENGTH)
  @MaxLength(ARCHITECTURE_TEMPLATE_MAX_PROMPT_LENGTH)
  public readonly prompt!: string;
}
