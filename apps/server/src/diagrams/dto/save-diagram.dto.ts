import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
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

  @IsString()
  @IsIn(['text', 'db', 'service', 'api'])
  public readonly type!: string;

  @IsNumber()
  public readonly x!: number;

  @IsNumber()
  public readonly y!: number;
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
