import { generarUUID } from "../utils/domainUtils.js";
import { Pedido } from "./Pedido.js";
import { Sesion } from "./Sesion.js";
import { Usuario } from "./Usuario.js";
export class Cliente extends Usuario {
    constructor(nombre, email, password, fechaNacimiento, estado = false, historialPedidos = [], id = generarUUID()) {
        super(nombre, email, password, fechaNacimiento, estado, id);
        this.historialPedidos = [...historialPedidos];
    }
    verHistorial() {
        return [...this.historialPedidos];
    }
    registrarPedido(pedido) {
        this.historialPedidos.push(pedido);
    }
    toSnapshot() {
        return {
            ...super.toSnapshot(),
            historialPedidos: this.historialPedidos.map((pedido) => pedido.toSnapshot())
        };
    }
    static fromSnapshot(snapshot) {
        const cliente = new Cliente(snapshot.nombre, snapshot.email, snapshot.password, new Date(snapshot.fechaNacimiento), snapshot.estado, snapshot.historialPedidos.map((pedido) => Pedido.fromSnapshot(pedido)), snapshot.id);
        cliente.restaurarSesion(snapshot.sesionActiva ? Sesion.fromSnapshot(snapshot.sesionActiva) : null);
        return cliente;
    }
}
