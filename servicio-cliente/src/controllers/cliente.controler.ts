import { Cliente } from "../models/cliente.model";

export type DatosCliente = {
    nombre: string;
    direccion?: string;
    telefono?: string;
};

export function obtenerClientes() {
    return Cliente.findAll();
}

export function obtenerClienteId(id: number) {
    return Cliente.findByPk(id);
}

export function crearCliente(data: DatosCliente) {
    return Cliente.create(data);
}

export async function actualizarCliente(id: number, data: Partial<DatosCliente>) {
    const [, clientes] = await Cliente.update(data, {
        where: { codigo: id },
        returning: true
    });

    return clientes[0] ?? null;
}

export function eliminarCliente(id: number) {
    return Cliente.destroy({ where: { codigo: id } });
}