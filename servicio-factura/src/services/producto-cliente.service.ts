import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';

import {Producto} from '../models/producto.model.js';
import 'dotenv/config';


@Injectable()
export class ProductoClienteService{
    private readonly url = process.env.URL;

    async consultar(codigo:number): Promise <any> {
        try{
            const respuesta = await fetch(`${this.url}/${codigo}`)
            if (respuesta.status == 404){
                throw new NotFoundException("Producto no encontrado");
            }

            if (!respuesta.ok) {
                throw new ServiceUnavailableException("Error al encontrar el producto");
            }
            const json = await respuesta.json();
            return json as Producto;
            
        } catch (error){
            if (error instanceof NotFoundException) throw error;
            throw new ServiceUnavailableException('Servicio de productos no disponible');
        }
    }
}