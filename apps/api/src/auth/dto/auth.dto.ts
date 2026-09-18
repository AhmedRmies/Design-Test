import { IsEmail, IsIn, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'ahmed@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Ahmed Masada' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @ApiPropertyOptional({ enum: ['CUSTOMER', 'SELLER'], default: 'CUSTOMER' })
  @IsOptional()
  @IsIn(['CUSTOMER', 'SELLER'])
  role?: 'CUSTOMER' | 'SELLER';
}

export class LoginDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() password!: string;
}

export class RefreshDto {
  @ApiProperty() @IsString() refreshToken!: string;
}
