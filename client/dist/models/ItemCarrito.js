import { generarUUID, redondearMoneda, validarEnteroPositivo } from "../utils/domainUtils.js";
export class ItemCarrito {
    constructor(producto, cantidad, variante, precioUnitario = producto.precio, id = generarUUID()) {
        validarEnteroPositivo(cantidad, "La cantidad");
        this.id = id;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.producto = producto;
        this.variante = variante;
    }
    calcularSubtotal() {
        return redondearMoneda(this.precioUnitario * this.cantidad);
    }
    incrementarCantidad(cantidadAdicional) {
        validarEnteroPositivo(cantidadAdicional, "La cantidad adicional");
        this.cantidad += cantidadAdicional;
    }
    actualizarCantidad(cantidad) {
        validarEnteroPositivo(cantidad, "La cantidad");
        this.cantidad = cantidad;
    }
    toSnapshot() {
        return {
            id: this.id,
            cantidad: this.cantidad,
            precioUnitario: this.precioUnitario,
            producto: this.producto.toSnapshot(),
            variante: this.variante?.toSnapshot()
        };
    }
    static fromSnapshot(snapshot, producto, variante) {
        return new ItemCarrito(producto, snapshot.cantidad, variante, snapshot.precioUnitario, snapshot.id);
    }
}
