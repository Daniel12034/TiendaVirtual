import {
  Decimal,
  Integer,
  ProductoSnapshot,
  UUID
} from "../types/domain.js";
import {
  generarUUID,
  validarDecimalNoNegativo,
  validarEnteroNoNegativo,
  validarEnteroPositivo
} from "../utils/domainUtils.js";
import { VarianteProducto } from "./VarianteProducto.js";

export class Producto {
  public readonly id: UUID;
  public readonly nombre: string;
  public readonly descripcion: string;
  public readonly precio: Decimal;
  public estado: boolean;
  private stock: Integer;
  private readonly variantes: VarianteProducto[];

  constructor(
    nombre: string,
    descripcion: string,
    precio: Decimal,
    estado: boolean = true,
    stock: Integer = 0,
    variantes: VarianteProducto[] = [],
    id: UUID = generarUUID()
  ) {
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

  public estaDisponible(cantidad: Integer = 1, varianteId?: UUID): boolean {
    if (!this.estado || !Number.isInteger(cantidad) || cantidad <= 0) {
      return false;
    }

    if (varianteId) {
      const variante = this.obtenerVariante(varianteId);
      return variante?.disponible(cantidad) ?? false;
    }

    return this.stock >= cantidad;
  }

  public reducirStock(cantidad: Integer, varianteId?: UUID): void {
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

  public obtenerVariante(varianteId: UUID): VarianteProducto | undefined {
    return this.variantes.find((variante) => variante.id === varianteId);
  }

  public obtenerVariantes(): VarianteProducto[] {
    return [...this.variantes];
  }

  public obtenerStock(): Integer {
    return this.stock;
  }

  public toSnapshot(): ProductoSnapshot {
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

  public static fromSnapshot(snapshot: ProductoSnapshot): Producto {
    const variantes = snapshot.variantes.map((variante) =>
      VarianteProducto.fromSnapshot(variante)
    );

    return new Producto(
      snapshot.nombre,
      snapshot.descripcion,
      snapshot.precio,
      snapshot.estado,
      snapshot.stock,
      variantes,
      snapshot.id
    );
  }
}
