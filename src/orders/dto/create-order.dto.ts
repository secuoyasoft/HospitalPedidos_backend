import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

// Clase para cada item de la orden
class OrderItemDto {
    @IsInt()
    @Min(1, { message: 'El ID del producto debe ser mayor a 0' })
    product_id: number;

    @IsInt()
    @Min(1, { message: 'El ID de la medida debe ser mayor a 0' })
    measure_id: number;

    @IsNumber()
    @Min(0.1, { message: 'La cantidad debe ser mayor a 0' })
    amount: number;

    @IsOptional()
    @IsNumber()
    @Min(0, { message: 'El precio no puede ser negativo' })
    price?: number;

    @IsOptional()
    @IsString()
    observation?: string;
}

export class CreateOrderDto {
    @IsInt()
    @Min(1, { message: 'El ID del hospital debe ser mayor a 0' })
    hospital_id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}