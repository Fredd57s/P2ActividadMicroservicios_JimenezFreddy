import { Injectable, NotFoundException, ConflictException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import {db} from '../../prisma/db';
import {Factura} from '../../models/factura.model';
import { DetalleFactura } from '../../models/detalles-factura.model';
import { ProductoClienteService } from '../../services/producto-cliente.service.js';

@Injectable()
export class FacturaService {
    constructor(private readonly productoCliente: ProductoClienteService) {}
    async crear (data : Factura) {
        const factura = await db.orm.Factura.where({codigo: data.codigo}).first();
        if(factura){
            throw new   ConflictException("Código ya existente")
        }

        return db.orm.Factura.create({...data, fecha: new Date(data.fecha)});
    }

    async listar () {
        return db.orm.Factura.all();
    }

    async consultar (codigo: string){
        const factura = await db.orm.Factura.where({codigo: codigo}).first();

        if (!factura){
            throw new NotFoundException("Factura no encontrada")
        }

        return factura;
    }

    async actualizarDetalleFactura(codigo: string, codigoDetalle: number, data: Partial<DetalleFactura>) {
    const factura = await this.consultar(codigo);
    const detalle = factura.detalles_factura.find((d) => d.codigo === codigoDetalle);
    if (!detalle) {
      throw new NotFoundException('Detalle no encontrado');
    }

    const cambios = {...detalle, ...data, codigo: codigoDetalle};
    cambios.subtotal = await this.calcularSubtotal(cambios.cod_producto, cambios.cantidad);

    return db.orm.Factura.where({ codigo }).update({
      detalles_factura: factura.detalles_factura.map((d) =>
        d.codigo === codigoDetalle ? cambios : d
      )
    });
  }


    async actualizar2(codigo: string, data: Partial<Factura>) {
        const cambios:Record<string, unknown> = {...data}
        if(data.fecha){
            cambios.fecha = new Date(data.fecha);
        }
        const factura = await db.orm.Factura.where({codigo:codigo}).update(cambios)

        if (!factura) {
            throw new NotFoundException("Factura no encontrada");
        }
        return factura;
    }

    async eliminar(codigo: string) {
        await this.consultar(codigo);
        await db.orm.Factura.where({ codigo }).delete();
        return { mensaje: `Factura eliminada correctamente` };
    }

    //Detale de factura
    /*async agregarDetalle(codigo: string, data: DetalleFactura){

    }

    //path
    async actualizarDetalle(){

    }

    async eliminarDetalle(){

    }

    public calcularsubtotal(){
        
    }*/
    async agregarDetalle(codigo: string, data: Omit<DetalleFactura, 'subtotal'>) {
        const factura = await this.consultar(codigo);

        if (!Number.isInteger(data.codigo) || data.codigo <= 0) {
            throw new BadRequestException('Código de detalle inválido');
        }

        if (factura.detalles_factura.some(d => d.codigo === data.codigo)) {
            throw new ConflictException('El código de detalle ya existe en esta factura');
        }

        const subtotal = await this.calcularsubtotal(data.cod_producto, data.cantidad);
        const detalle = {
            codigo: data.codigo,
            cod_producto: data.cod_producto,
            cantidad: data.cantidad,
            subtotal
        };

        return this.guardarDetalles(factura, [...factura.detalles_factura, detalle]);
    }

    async actualizarDetalle(codigo: string, codigoDetalle: number, cantidad: number) {
        const factura = await this.consultar(codigo);
        const detalle = factura.detalles_factura.find(d => d.codigo === codigoDetalle);

        if (!detalle) {
            throw new NotFoundException('Detalle no encontrado');
        }

        const subtotal = await this.calcularsubtotal(detalle.cod_producto, cantidad);
        const detalles = factura.detalles_factura.map(d =>
            d.codigo === codigoDetalle ? { ...d, cantidad, subtotal } : d
        );

        return this.guardarDetalles(factura, detalles);
    }

    async eliminarDetalle2(codigo: string, codigoDetalle: number) {
        const factura = await this.consultar(codigo);
        const detalles = factura.detalles_factura.filter(d => d.codigo !== codigoDetalle);

        if (detalles.length === factura.detalles_factura.length) {
            throw new NotFoundException('Detalle no encontrado');
        }

        return this.guardarDetalles(factura, detalles);
    }

    async eliminarDetalle(codigo: string, detalleId: number) {
        const factura = await db.orm.Factura.where({ codigo }).first();
        if (!factura) {
            throw new NotFoundException("Factura no encontrada");
        }
        const detalles = factura.detalles_factura.filter((d) => 
            d.codigo !== detalleId);
        if (detalles.length === factura.detalles_factura.length) {
            throw new NotFoundException("Detalle no encontrado");
        }
        return db.orm.Factura.where({ id: factura.id })
        .update({ detalles_factura: detalles });
    }

    public async calcularsubtotal(codProducto: number, cantidad: number): Promise<number> {
        if (!Number.isInteger(codProducto) || codProducto <= 0 ||
            !Number.isInteger(cantidad) || cantidad <= 0 || cantidad > 2147483647) {
            throw new BadRequestException('Producto y cantidad deben ser enteros positivos válidos');
        }

        const producto = await this.productoCliente.consultar(codProducto);

        if (!Number.isFinite(producto?.precio) || producto.precio < 0) {
            throw new ServiceUnavailableException('El producto tiene un precio inválido');
        }

        return Math.round(producto.precio * cantidad * 100) / 100;
    }

    private async guardarDetalles(
        factura: Awaited<ReturnType<FacturaService['consultar']>>,
        detalles: DetalleFactura[]
    ) {
        const total = detalles.reduce(
            (suma, d) => suma + Math.round(d.subtotal * 100), 0
        ) / 100;

        const total_a_pagar = Math.round((total + factura.iva - factura.descuento) * 100) / 100;

        if (total_a_pagar < 0) {
            throw new BadRequestException('Revisa el descuento de la factura');
        }

        const actualizada = await db.orm.Factura.where({
            codigo: factura.codigo,
            detalles_factura: factura.detalles_factura,
            iva: factura.iva,
            descuento: factura.descuento
        }).update({ detalles_factura: detalles, total, total_a_pagar });

        if (!actualizada) {
            throw new ConflictException('La factura cambió. Vuelve a consultarla');
        }

        return actualizada;
    }

    public async calcularSubtotal(cod_producto: number, cantidad: number) {
        const producto = await this.productoCliente.consultar(cod_producto);
        return producto.precio * cantidad;
    }
}



