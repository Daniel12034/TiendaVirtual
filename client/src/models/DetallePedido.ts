import {
  Decimal,
  DetallePedidoSnapshot,
  Integer
} from "../types/domain.js";
import {
  redondearMoneda,
  validarEnteroPositivo
} from "../utils/domainUtils.js";

export class DetallePedido {
  public readonly cantidad: Integer;
  public readonly precioUnitario: Decimal;
  public readonly productoNombre: string;
  public readonly varianteSeleccionada?: string;

  constructor(
    cantidad: Integer,
    precioUnitario: Decimal,
    productoNombre: string,
    varianteSeleccionada?: string
  ) {
    validarEnteroPositivo(cantidad, "La cantidad");

    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.productoNombre = productoNombre;
    this.varianteSeleccionada = varianteSeleccionada;
  }

  public calcularSubtotal(): Decimal {
    return redondearMoneda(this.precioUnitario * this.cantidad);
  }

  public toSnapshot(): DetallePedidoSnapshot {
    return {
      cantidad: this.cantidad,
      precioUnitario: this.precioUnitario,
      productoNombre: this.productoNombre,
      varianteSeleccionada: this.varianteSeleccionada
    };
  }

  public static fromSnapshot(
    snapshot: DetallePedidoSnapshot
  ): DetallePedido {
    return new DetallePedido(
      snapshot.cantidad,
      snapshot.precioUnitario,
      snapshot.productoNombre,
      snapshot.varianteSeleccionada
    );
  }
}
