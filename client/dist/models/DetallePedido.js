import { redondearMoneda, validarEnteroPositivo } from "../utils/domainUtils.js";
export class DetallePedido {
    constructor(cantidad, precioUnitario, productoNombre, varianteSeleccionada) {
        validarEnteroPositivo(cantidad, "La cantidad");
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.productoNombre = productoNombre;
        this.varianteSeleccionada = varianteSeleccionada;
    }
    calcularSubtotal() {
        return redondearMoneda(this.precioUnitario * this.cantidad);
    }
    toSnapshot() {
        return {
            cantidad: this.cantidad,
            precioUnitario: this.precioUnitario,
            productoNombre: this.productoNombre,
            varianteSeleccionada: this.varianteSeleccionada
        };
    }
    static fromSnapshot(snapshot) {
        return new DetallePedido(snapshot.cantidad, snapshot.precioUnitario, snapshot.productoNombre, snapshot.varianteSeleccionada);
    }
}
