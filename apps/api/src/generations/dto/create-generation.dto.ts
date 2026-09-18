import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const GENERATION_STYLES = [
  'vector',
  'illustration',
  'photoreal',
  'minimal',
  'retro',
  'anime',
] as const;

export class CreateGenerationDto {
  @ApiProperty({ example: 'a wolf howling at a geometric moon' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  prompt!: string;

  @ApiPropertyOptional({ enum: GENERATION_STYLES, default: 'vector' })
  @IsOptional()
  @IsIn(GENERATION_STYLES as unknown as string[])
  style?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  transparentBackground?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enhancePrompt?: boolean;
}
