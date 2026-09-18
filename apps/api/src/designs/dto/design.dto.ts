import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsHexColor,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDesignDto {
  @ApiProperty({ example: 'Howling Wolf Tee' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 'classic-tee' })
  @IsString()
  garmentSlug!: string;

  @ApiProperty({ example: '#FFFFFF' })
  @IsHexColor()
  colorHex!: string;

  @ApiProperty({ description: 'Map of print area name -> array of layers', type: Object })
  @IsObject()
  layers!: Record<string, unknown[]>;

  @ApiPropertyOptional({ description: 'Data URL of the 3D preview render' })
  @IsOptional()
  @IsString()
  previewDataUrl?: string;

  @ApiPropertyOptional({ enum: ['PRIVATE', 'UNLISTED', 'PUBLIC'] })
  @IsOptional()
  @IsIn(['PRIVATE', 'UNLISTED', 'PUBLIC'])
  visibility?: 'PRIVATE' | 'UNLISTED' | 'PUBLIC';
}

export class UpdateDesignDto {
  @IsOptional() @IsString() @MaxLength(80) name?: string;
  @IsOptional() @IsHexColor() colorHex?: string;
  @IsOptional() @IsObject() layers?: Record<string, unknown[]>;
  @IsOptional() @IsString() previewDataUrl?: string;
  @IsOptional() @IsIn(['PRIVATE', 'UNLISTED', 'PUBLIC']) visibility?: 'PRIVATE' | 'UNLISTED' | 'PUBLIC';
}
