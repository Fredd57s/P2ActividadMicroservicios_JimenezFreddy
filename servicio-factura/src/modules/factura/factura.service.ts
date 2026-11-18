import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import {db} from '../../prisma/db';
import {Factura} from '../../models/factura.model';
import { DetalleFactura } from '../../models/detalles-factura.model';


@Injectable()
export class FacturaService {
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
    }


    async actualizar(codigo: string, data: Partial<Factura>) {
        const cambios:Record<string,t> = {...data}
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
    async agregarDetalle(codigo: string, data: DetalleFactura){

    }

    //path
    async actualizarDetalle(){

    }

    async eliminarDetalle(){

    }

    public calcularsubtotal(){
        
    }
}


