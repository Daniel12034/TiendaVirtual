import {
  DateTime,
  Decimal,
  PedidoSnapshot,
  UUID
} from "../types/domain.js";
import { generarUUID, redondearMoneda } from "../utils/domainUtils.js";
import { Carrito } from "./Carrito.js";
import { DetallePedido } from "./DetallePedido.js";

export class Pedido {
  public readonly id: UUID;
  public fecha: DateTime;
  public total: Decimal;
  private detalles: DetallePedido[];

  constructor(
    fecha: DateTime = new Date(),
    total: Decimal = 0,
    detalles: DetallePedido[] = [],
    id: UUID = generarUUID()
  ) {
    this.id = id;
    this.fecha = fecha;
    this.total = total;
    this.detalles = [...detalles];
  }

  public generarOrden(carrito: Carrito): Pedido {
    const items = carrito.obtenerItems();

    if (items.length === 0) {
      throw new Error("No se puede generar una orden con un carrito vacio.");
    }

    for (const item of items) {
      if (!item.producto.estaDisponible(item.cantidad, item.variante?.id)) {
        throw new Error(
          `Stock insuficiente para confirmar el producto ${item.producto.nombre}.`
        );
      }
    }

    this.detalles = items.map((item) => {
      item.producto.reducirStock(item.cantidad, item.variante?.id);

      return new DetallePedido(
        item.cantidad,
        item.precioUnitario,
        item.producto.nombre,
        item.variante ? `${item.variante.nombre}: ${item.variante.valor}` : undefined
      );
    });

    this.total = redondearMoneda(
      this.detalles.reduce(
        (acumulado, detalle) => acumulado + detalle.calcularSubtotal(),
        0
      )
    );
    this.fecha = new Date();
    carrito.vaciar();

    return this;
  }

  public obtenerDetalles(): DetallePedido[] {
    return [...this.detalles];
  }

  public toSnapshot(): PedidoSnapshot {
    return {
      id: this.id,
      fecha: this.fecha.toISOString(),
      total: this.total,
      detalles: this.detalles.map((detalle) => detalle.toSnapshot())
    };
  }

  public static fromSnapshot(snapshot: PedidoSnapshot): Pedido {
    return new Pedido(
      new Date(snapshot.fecha),
      snapshot.total,
      snapshot.detalles.map((detalle) => DetallePedido.fromSnapshot(detalle)),
      snapshot.id
    );
  }
}
