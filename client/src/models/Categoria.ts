import { UUID } from "../types/domain.js";
import { generarUUID } from "../utils/domainUtils.js";
import { Producto } from "./Producto.js";

export class Categoria {
  public readonly id: UUID;
  public readonly nombre: string;
  public readonly descripcion: string;
  private readonly productos: Producto[];

  constructor(
    nombre: string,
    descripcion: string,
    productos: Producto[] = [],
    id: UUID = generarUUID()
  ) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.productos = [...productos];
  }

  public obtenerProductos(): Producto[] {
    return [...this.productos];
  }
}
