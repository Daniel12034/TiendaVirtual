import { generarUUID, redondearMoneda, validarEnteroNoNegativo, validarEnteroPositivo } from "../utils/domainUtils.js";
import { ItemCarrito } from "./ItemCarrito.js";
import { Producto } from "./Producto.js";
import { VarianteProducto } from "./VarianteProducto.js";
export class Carrito {
    constructor(fechaCreacion = new Date(), items = [], id = generarUUID()) {
        this.id = id;
        this.fechaCreacion = fechaCreacion;
        this.items = [...items];
    }
    agregarProducto(producto, cantidad = 1, variante) {
        validarEnteroPositivo(cantidad, "La cantidad");
        const varianteId = variante?.id;
        const itemExistente = this.items.find((item) => item.producto.id === producto.id && item.variante?.id === varianteId);
        const cantidadSolicitada = (itemExistente?.cantidad ?? 0) + cantidad;
        if (!producto.estaDisponible(cantidadSolicitada, varianteId)) {
            throw new Error(`No hay stock suficiente para agregar ${cantidadSolicitada} unidad(es) de ${producto.nombre}.`);
        }
        if (itemExistente) {
            itemExistente.incrementarCantidad(cantidad);
            return itemExistente;
        }
        const nuevoItem = new ItemCarrito(producto, cantidad, variante);
        this.items.push(nuevoItem);
        return nuevoItem;
    }
    eliminarProducto(productoId, varianteId) {
        const indice = this.items.findIndex((item) => item.producto.id === productoId && item.variante?.id === varianteId);
        if (indice === -1) {
            throw new Error("El producto no existe en el carrito.");
        }
        this.items.splice(indice, 1);
    }
    actualizarCantidad(productoId, cantidad, varianteId) {
        validarEnteroNoNegativo(cantidad, "La cantidad");
        const item = this.obtenerItem(productoId, varianteId);
        if (!item) {
            throw new Error("El producto no existe en el carrito.");
        }
        if (cantidad === 0) {
            this.eliminarProducto(productoId, varianteId);
            return null;
        }
        if (!item.producto.estaDisponible(cantidad, varianteId)) {
            throw new Error(`No hay stock suficiente para dejar ${cantidad} unidad(es) de ${item.producto.nombre}.`);
        }
        item.actualizarCantidad(cantidad);
        return item;
    }
    calcularTotal() {
        return redondearMoneda(this.items.reduce((total, item) => total + item.calcularSubtotal(), 0));
    }
    obtenerItems() {
        return [...this.items];
    }
    obtenerItem(productoId, varianteId) {
        return this.items.find((item) => item.producto.id === productoId && item.variante?.id === varianteId);
    }
    vaciar() {
        this.items.splice(0, this.items.length);
    }
    toSnapshot() {
        return {
            id: this.id,
            fechaCreacion: this.fechaCreacion.toISOString(),
            items: this.items.map((item) => item.toSnapshot()),
            total: this.calcularTotal()
        };
    }
    static fromSnapshot(snapshot, catalogoProductos = []) {
        const items = snapshot.items.map((itemSnapshot) => {
            const productoCatalogo = catalogoProductos.find((producto) => producto.id === itemSnapshot.producto.id);
            const producto = productoCatalogo &&
                (!itemSnapshot.variante ||
                    productoCatalogo.obtenerVariante(itemSnapshot.variante.id))
                ? productoCatalogo
                : Producto.fromSnapshot(itemSnapshot.producto);
            const variante = itemSnapshot.variante
                ? producto.obtenerVariante(itemSnapshot.variante.id) ??
                    VarianteProducto.fromSnapshot(itemSnapshot.variante)
                : undefined;
            return ItemCarrito.fromSnapshot(itemSnapshot, producto, variante);
        });
        return new Carrito(new Date(snapshot.fechaCreacion), items, snapshot.id);
    }
}
