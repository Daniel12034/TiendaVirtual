import { generarUUID, redondearMoneda } from "../utils/domainUtils.js";
import { DetallePedido } from "./DetallePedido.js";
export class Pedido {
    constructor(fecha = new Date(), total = 0, detalles = [], id = generarUUID()) {
        this.id = id;
        this.fecha = fecha;
        this.total = total;
        this.detalles = [...detalles];
    }
    generarOrden(carrito) {
        const items = carrito.obtenerItems();
        if (items.length === 0) {
            throw new Error("No se puede generar una orden con un carrito vacio.");
        }
        for (const item of items) {
            if (!item.producto.estaDisponible(item.cantidad, item.variante?.id)) {
                throw new Error(`Stock insuficiente para confirmar el producto ${item.producto.nombre}.`);
            }
        }
        this.detalles = items.map((item) => {
            item.producto.reducirStock(item.cantidad, item.variante?.id);
            return new DetallePedido(item.cantidad, item.precioUnitario, item.producto.nombre, item.variante ? `${item.variante.nombre}: ${item.variante.valor}` : undefined);
        });
        this.total = redondearMoneda(this.detalles.reduce((acumulado, detalle) => acumulado + detalle.calcularSubtotal(), 0));
        this.fecha = new Date();
        carrito.vaciar();
        return this;
    }
    obtenerDetalles() {
        return [...this.detalles];
    }
    toSnapshot() {
        return {
            id: this.id,
            fecha: this.fecha.toISOString(),
            total: this.total,
            detalles: this.detalles.map((detalle) => detalle.toSnapshot())
        };
    }
    static fromSnapshot(snapshot) {
        return new Pedido(new Date(snapshot.fecha), snapshot.total, snapshot.detalles.map((detalle) => DetallePedido.fromSnapshot(detalle)), snapshot.id);
    }
}
