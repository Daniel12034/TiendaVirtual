import { generarUUID } from "../utils/domainUtils.js";
export class Categoria {
    constructor(nombre, descripcion, productos = [], id = generarUUID()) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.productos = [...productos];
    }
    obtenerProductos() {
        return [...this.productos];
    }
}
