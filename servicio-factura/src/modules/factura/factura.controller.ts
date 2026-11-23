import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { FacturaService } from './factura.service.js';
import { DetalleFactura } from '../../models/detalles-factura.model';

@Controller('facturas')
export class FacturaController {
    constructor(private readonly facturaService: FacturaService){}

    @Get()
    listar(){
        this.facturaService.listar();
    }

    @Get(':codigo')
    consultar(@Param('codigo')codigo: string){
        return this.facturaService.consultar(codigo);
    }

    @Post()
    crear(@Body() data: any) {
        return this.facturaService.crear(data);
    }

    @Patch(':codigo')
    actualizar(@Param('codigo') codigo: string, @Body() data: Partial<any>) {
        return this.facturaService.actualizar2(codigo, data);
    }

    @Delete(':codigo')
    eliminar(@Param('codigo') codigo: string) {
        return this.facturaService.eliminar(codigo);
    }

    @Post(':codigo/detalles')
    agregarDetalle(
        @Param('codigo') codigo: string, @Body() data: any) {
        return this.facturaService.agregarDetalle(codigo, data);
    }

    @Delete(':codigo/detalles/:detalleId')
    eliminarDetalle(
        @Param('codigo') codigo: string,
        @Param('detalleId', ParseIntPipe) detalleId: number
    ) {
        return this.facturaService.eliminarDetalle(codigo, detalleId);
    }

    @Patch(':codigo/detalle/:codigoDetalle')
    actualizarDetalle(
        @Param('codigo') codigo: string,
        @Param('codigoDetalle', ParseIntPipe) codigoDetalle: number,
        @Body('cantidad', ParseIntPipe) cantidad: number
    ) {
        return this.facturaService.actualizarDetalle(codigo, codigoDetalle, cantidad);
    }

}
