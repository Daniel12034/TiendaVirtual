import {
  Integer,
  UUID,
  VarianteProductoSnapshot
} from "../types/domain.js";
import {
  generarUUID,
  validarEnteroNoNegativo,
  validarEnteroPositivo
} from "../utils/domainUtils.js";

export class VarianteProducto {
  public readonly id: UUID;
  public readonly nombre: string;
  public readonly valor: string;
  private stock: Integer;

  constructor(
    nombre: string,
    valor: string,
    stock: Integer,
    id: UUID = generarUUID()
  ) {
    validarEnteroNoNegativo(stock, "El stock de la variante");

    this.id = id;
    this.nombre = nombre;
    this.valor = valor;
    this.stock = stock;
  }

  public disponible(cantidad: Integer = 1): boolean {
    return Number.isInteger(cantidad) && cantidad > 0 && this.stock >= cantidad;
  }

  public reducirStock(cantidad: Integer): void {
    validarEnteroPositivo(cantidad, "La cantidad");

    if (!this.disponible(cantidad)) {
      throw new Error(
        `La variante ${this.nombre}=${this.valor} no tiene stock suficiente.`
      );
    }

    this.stock -= cantidad;
  }

  public obtenerStock(): Integer {
    return this.stock;
  }

  public toSnapshot(): VarianteProductoSnapshot {
    return {
      id: this.id,
      nombre: this.nombre,
      valor: this.valor,
      stock: this.stock
    };
  }

  public static fromSnapshot(
    snapshot: VarianteProductoSnapshot
  ): VarianteProducto {
    return new VarianteProducto(
      snapshot.nombre,
      snapshot.valor,
      snapshot.stock,
      snapshot.id
    );
  }
}
