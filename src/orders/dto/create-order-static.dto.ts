import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class OrderItemStaticDto {
    @IsString()
    product_name: string;

    @IsString()
    amount_measure: string; // e.g. "5 Kilos"

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsBoolean()
    buy_check?: boolean;

    @IsOptional()
    @IsString()
    observation?: string;
}

export class CreateOrderStaticDto {
    @IsInt()
    @Min(1)
    hospital_id: number;

    @IsString()
    userOrder: string;

    @IsOptional()
    @IsString()
    order_name?: string;

    @IsNumber()
    total_price: number;

    // quantity_purchase y quantity_details se pueden calcular o enviar en 0
    @IsOptional()
    @IsInt()
    quantity_purchase?: number;

    @IsOptional()
    @IsInt()
    quantity_details?: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemStaticDto)
    items: OrderItemStaticDto[];
}
