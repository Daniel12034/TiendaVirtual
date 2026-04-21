import { generarUUID, validarEnteroNoNegativo, validarEnteroPositivo } from "../utils/domainUtils.js";
export class VarianteProducto {
    constructor(nombre, valor, stock, id = generarUUID()) {
        validarEnteroNoNegativo(stock, "El stock de la variante");
        this.id = id;
        this.nombre = nombre;
        this.valor = valor;
        this.stock = stock;
    }
    disponible(cantidad = 1) {
        return Number.isInteger(cantidad) && cantidad > 0 && this.stock >= cantidad;
    }
    reducirStock(cantidad) {
        validarEnteroPositivo(cantidad, "La cantidad");
        if (!this.disponible(cantidad)) {
            throw new Error(`La variante ${this.nombre}=${this.valor} no tiene stock suficiente.`);
        }
        this.stock -= cantidad;
    }
    obtenerStock() {
        return this.stock;
    }
    toSnapshot() {
        return {
            id: this.id,
            nombre: this.nombre,
            valor: this.valor,
            stock: this.stock
        };
    }
    static fromSnapshot(snapshot) {
        return new VarianteProducto(snapshot.nombre, snapshot.valor, snapshot.stock, snapshot.id);
    }
}
