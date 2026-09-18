import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AddressDto {
  @ApiProperty() @IsString() fullName!: string;
  @ApiProperty() @IsString() line1!: string;
  @IsOptional() @IsString() line2?: string;
  @ApiProperty() @IsString() city!: string;
  @IsOptional() @IsString() region?: string;
  @ApiProperty() @IsString() postalCode!: string;
  @ApiProperty({ example: 'PS' }) @IsString() @Length(2, 2) country!: string;
  @IsOptional() @IsString() phone?: string;
}

export class OrderItemDto {
  @ApiProperty() @IsString() productId!: string;
  @ApiProperty({ example: 'M' }) @IsString() size!: string;
  @ApiProperty({ example: '#FFFFFF' }) @IsString() colorHex!: string;
  @ApiProperty({ example: 1 }) @IsInt() @Min(1) @Max(20) quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress!: AddressDto;
}
