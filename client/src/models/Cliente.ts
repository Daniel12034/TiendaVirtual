import { ClienteSnapshot, UUID } from "../types/domain.js";
import { generarUUID } from "../utils/domainUtils.js";
import { Pedido } from "./Pedido.js";
import { Sesion } from "./Sesion.js";
import { Usuario } from "./Usuario.js";

export class Cliente extends Usuario {
  private readonly historialPedidos: Pedido[];

  constructor(
    nombre: string,
    email: string,
    password: string,
    fechaNacimiento: Date,
    estado: boolean = false,
    historialPedidos: Pedido[] = [],
    id: UUID = generarUUID()
  ) {
    super(nombre, email, password, fechaNacimiento, estado, id);
    this.historialPedidos = [...historialPedidos];
  }

  public verHistorial(): Pedido[] {
    return [...this.historialPedidos];
  }

  public registrarPedido(pedido: Pedido): void {
    this.historialPedidos.push(pedido);
  }

  public override toSnapshot(): ClienteSnapshot {
    return {
      ...super.toSnapshot(),
      historialPedidos: this.historialPedidos.map((pedido) => pedido.toSnapshot())
    };
  }

  public static fromSnapshot(snapshot: ClienteSnapshot): Cliente {
    const cliente = new Cliente(
      snapshot.nombre,
      snapshot.email,
      snapshot.password,
      new Date(snapshot.fechaNacimiento),
      snapshot.estado,
      snapshot.historialPedidos.map((pedido) => Pedido.fromSnapshot(pedido)),
      snapshot.id
    );

    cliente.restaurarSesion(
      snapshot.sesionActiva ? Sesion.fromSnapshot(snapshot.sesionActiva) : null
    );

    return cliente;
  }
}
