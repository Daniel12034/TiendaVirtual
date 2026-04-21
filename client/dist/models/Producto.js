import { generarUUID, validarDecimalNoNegativo, validarEnteroNoNegativo, validarEnteroPositivo } from "../utils/domainUtils.js";
import { VarianteProducto } from "./VarianteProducto.js";
export class Producto {
    constructor(nombre, descripcion, precio, estado = true, stock = 0, variantes = [], id = generarUUID()) {
        validarDecimalNoNegativo(precio, "El precio");
        validarEnteroNoNegativo(stock, "El stock del producto");
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.estado = estado;
        this.stock = stock;
        this.variantes = [...variantes];
    }
    estaDisponible(cantidad = 1, varianteId) {
        if (!this.estado || !Number.isInteger(cantidad) || cantidad <= 0) {
            return false;
        }
        if (varianteId) {
            const variante = this.obtenerVariante(varianteId);
            return variante?.disponible(cantidad) ?? false;
        }
        return this.stock >= cantidad;
    }
    reducirStock(cantidad, varianteId) {
        validarEnteroPositivo(cantidad, "La cantidad");
        if (!this.estado) {
            throw new Error(`El producto ${this.nombre} no esta disponible.`);
        }
        if (varianteId) {
            const variante = this.obtenerVariante(varianteId);
            if (!variante) {
                throw new Error("La variante solicitada no existe para este producto.");
            }
            variante.reducirStock(cantidad);
            return;
        }
        if (!this.estaDisponible(cantidad)) {
            throw new Error(`El producto ${this.nombre} no tiene stock suficiente.`);
        }
        this.stock -= cantidad;
    }
    obtenerVariante(varianteId) {
        return this.variantes.find((variante) => variante.id === varianteId);
    }
    obtenerVariantes() {
        return [...this.variantes];
    }
    obtenerStock() {
        return this.stock;
    }
    toSnapshot() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            precio: this.precio,
            estado: this.estado,
            stock: this.stock,
            variantes: this.variantes.map((variante) => variante.toSnapshot())
        };
    }
    static fromSnapshot(snapshot) {
        const variantes = snapshot.variantes.map((variante) => VarianteProducto.fromSnapshot(variante));
        return new Producto(snapshot.nombre, snapshot.descripcion, snapshot.precio, snapshot.estado, snapshot.stock, variantes, snapshot.id);
    }
}
