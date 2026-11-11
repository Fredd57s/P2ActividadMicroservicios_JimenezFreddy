import type { FastifyInstance } from "fastify";
import { obtenerClienteId, obtenerClientes, crearCliente, actualizarCliente, eliminarCliente } from "../controllers/cliente.controler";
import type { DatosCliente } from "../controllers/cliente.controler";

type ParamsCliente = { id: string };
type ValidacionCliente = { datos: Partial<DatosCliente> } | { mensaje: string };

function leerId(valor: string): number | null {
    const id = Number(valor);

    if (!/^\d+$/.test(valor) || id < 1 || id > 2147483647) {
        return null;
    }

    return id;
}

function validarCliente(body: unknown): ValidacionCliente {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return { mensaje: "Envía un objeto JSON con los datos del cliente" };
    }

    const campos = ["nombre", "direccion", "telefono"];
    if (Object.keys(body).some(campo => !campos.includes(campo))) {
        return { mensaje: "Solo se permiten nombre, direccion y telefono" };
    }

    const { nombre, direccion, telefono } = body as Record<string, unknown>;
    const datos: Partial<DatosCliente> = {};

    if (nombre !== undefined) {
        const texto = typeof nombre === "string" ? nombre.trim() : "";
        const patronNombre = /^\p{L}[\p{L}\p{M}]*(?:[ '\u2019-]\p{L}[\p{L}\p{M}]*)*$/u;

        if (texto.length < 2 || texto.length > 80 || !patronNombre.test(texto)) {
            return { mensaje: "El nombre debe tener de 2 a 80 caracteres y usar letras, espacios, guiones o apóstrofos" };
        }

        datos.nombre = texto;
    }

    if (direccion !== undefined) {
        const texto = typeof direccion === "string" ? direccion.trim() : "";

        if (texto.length < 3 || texto.length > 150) {
            return { mensaje: "La dirección debe tener de 3 a 150 caracteres" };
        }

        datos.direccion = texto;
    }

    if (telefono !== undefined) {
        if (typeof telefono !== "string" || !/^\d{10}$/.test(telefono)) {
            return { mensaje: "El teléfono debe enviarse como texto y contener exactamente 10 dígitos" };
        }

        datos.telefono = telefono;
    }

    return { datos };
}

export const clienteRouter = async (app: FastifyInstance) => {
    app.get("/clientes", obtenerClientes);

    app.get<{ Params: ParamsCliente }>("/clientes/:id", async (req, res) => {
        const id = leerId(req.params.id);
        if (id === null) {
            return res.code(400).send({ mensaje: "El ID debe ser un entero positivo válido" });
        }

        const cliente = await obtenerClienteId(id);
        if (!cliente) {
            return res.code(404).send({ mensaje: "Cliente no encontrado" });
        }

        return cliente;
    });

    app.post("/clientes", async (req, res) => {
        const resultado = validarCliente(req.body);
        if ("mensaje" in resultado) {
            return res.code(400).send(resultado);
        }

        const { nombre, ...otrosDatos } = resultado.datos;
        if (nombre === undefined) {
            return res.code(400).send({ mensaje: "El nombre es obligatorio" });
        }

        const cliente = await crearCliente({ nombre, ...otrosDatos });
        return res.code(201).send(cliente);
    });

    app.put<{ Params: ParamsCliente }>("/clientes/:id", async (req, res) => {
        const id = leerId(req.params.id);
        if (id === null) {
            return res.code(400).send({ mensaje: "El ID debe ser un entero positivo válido" });
        }

        const resultado = validarCliente(req.body);
        if ("mensaje" in resultado) {
            return res.code(400).send(resultado);
        }
        if (Object.keys(resultado.datos).length === 0) {
            return res.code(400).send({ mensaje: "Envía un campo para actualizar" });
        }

        const cliente = await actualizarCliente(id, resultado.datos);
        if (!cliente) {
            return res.code(404).send({ mensaje: "Cliente no encontrado" });
        }

        return cliente;
    });

    app.delete<{ Params: ParamsCliente }>("/clientes/:id", async (req, res) => {
        const id = leerId(req.params.id);
        if (id === null) {
            return res.code(400).send({ mensaje: "El ID debe ser un entero positivo válido" });
        }

        const eliminados = await eliminarCliente(id);
        if (eliminados === 0) {
            return res.code(404).send({ mensaje: "Cliente no encontrado" });
        }

        return { mensaje: "Cliente eliminado correctamente" };
    });
};