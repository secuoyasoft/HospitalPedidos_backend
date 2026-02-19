import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderItemDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsOptional()
    @IsBoolean()
    buy_check?: boolean;

    @IsOptional()
    @IsString()
    observation?: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsInt()
    @IsNotEmpty()
    order_id: number;

    @IsInt()
    @IsNotEmpty()
    product_id: number;

    @IsInt()
    @IsNotEmpty()
    measure_id: number;
}
