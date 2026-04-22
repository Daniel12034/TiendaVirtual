import {
  Decimal,
  Integer,
  ItemCarritoSnapshot,
  UUID
} from "../types/domain.js";
import {
  generarUUID,
  redondearMoneda,
  validarEnteroPositivo
} from "../utils/domainUtils.js";
import { Producto } from "./Producto.js";
import { VarianteProducto } from "./VarianteProducto.js";

export class ItemCarrito {
  public readonly id: UUID;
  public cantidad: Integer;
  public readonly precioUnitario: Decimal;
  public readonly producto: Producto;
  public readonly variante?: VarianteProducto;

  constructor(
    producto: Producto,
    cantidad: Integer,
    variante?: VarianteProducto,
    precioUnitario: Decimal = producto.precio,
    id: UUID = generarUUID()
  ) {
    validarEnteroPositivo(cantidad, "La cantidad");

    this.id = id;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.producto = producto;
    this.variante = variante;
  }

  public calcularSubtotal(): Decimal {
    return redondearMoneda(this.precioUnitario * this.cantidad);
  }

  public incrementarCantidad(cantidadAdicional: Integer): void {
    validarEnteroPositivo(cantidadAdicional, "La cantidad adicional");
    this.cantidad += cantidadAdicional;
  }

  public actualizarCantidad(cantidad: Integer): void {
    validarEnteroPositivo(cantidad, "La cantidad");
    this.cantidad = cantidad;
  }

  public toSnapshot(): ItemCarritoSnapshot {
    return {
      id: this.id,
      cantidad: this.cantidad,
      precioUnitario: this.precioUnitario,
      producto: this.producto.toSnapshot(),
      variante: this.variante?.toSnapshot()
    };
  }

  public static fromSnapshot(
    snapshot: ItemCarritoSnapshot,
    producto: Producto,
    variante?: VarianteProducto
  ): ItemCarrito {
    return new ItemCarrito(
      producto,
      snapshot.cantidad,
      variante,
      snapshot.precioUnitario,
      snapshot.id
    );
  }
}
