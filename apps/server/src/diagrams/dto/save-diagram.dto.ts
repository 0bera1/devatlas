import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class SaveDiagramNodeBodyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  public readonly id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  public readonly label!: string;

  /** Motor `database` / `external` / `custom`; API geriye dönük `db` kabul eder. */
  @IsString()
  @IsIn([
    'text',
    'db',
    'database',
    'service',
    'api',
    'cache',
    'queue',
    'external',
    'custom',
  ])
  public readonly type!: string;

  @IsNumber()
  public readonly x!: number;

  @IsNumber()
  public readonly y!: number;

  @IsOptional()
  @IsNumber()
  public readonly width?: number;

  @IsOptional()
  @IsNumber()
  public readonly height?: number;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  public readonly relatedDiagramId?: string | null;

  /** Düğüm detay alanları (açıklama, markdown, etiketler, durum, …). */
  @IsOptional()
  @IsObject()
  public readonly extras?: Record<string, unknown> | null;
}

export class SaveDiagramEdgeBodyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  public readonly from!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  public readonly to!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  public readonly label?: string;

  @IsOptional()
  @IsString()
  @IsIn(['smoothstep', 'straight', 'step', 'default'])
  public readonly type?: string;

  @IsOptional()
  @IsBoolean()
  public readonly animated?: boolean;
}

export class SaveDiagramBodyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveDiagramNodeBodyDto)
  public readonly nodes!: SaveDiagramNodeBodyDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveDiagramEdgeBodyDto)
  public readonly edges!: SaveDiagramEdgeBodyDto[];
}
