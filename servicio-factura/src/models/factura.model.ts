import { DetalleFactura } from "./detalles-factura.model";

export interface Factura {
    codigo: string;
    fecha: string;
    cod_cliente: number;
    total: number;
    descuento: number;
    iva: number;
    total_a_pagar: number;
    
    detalles_factura: DetalleFactura[];
}