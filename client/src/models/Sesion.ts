import { DateTime, SesionSnapshot, UUID } from "../types/domain.js";
import { agregarMinutos, generarUUID } from "../utils/domainUtils.js";

export class Sesion {
  public readonly id: UUID;
  public readonly token: string;
  public readonly fechaInicio: DateTime;
  public fechaExpiracion: DateTime;
  private activa: boolean;

  constructor(
    fechaInicio: DateTime = new Date(),
    id: UUID = generarUUID(),
    token: string = generarUUID(),
    fechaExpiracion: DateTime = agregarMinutos(fechaInicio, 30),
    activa: boolean = true
  ) {
    this.id = id;
    this.token = token;
    this.fechaInicio = fechaInicio;
    this.fechaExpiracion = fechaExpiracion;
    this.activa = activa;
  }

  public esValida(fechaActual: DateTime = new Date()): boolean {
    if (!this.activa) {
      return false;
    }

    if (fechaActual.getTime() > this.fechaExpiracion.getTime()) {
      this.invalidar(fechaActual);
      return false;
    }

    return true;
  }

  public registrarActividad(fechaActual: DateTime = new Date()): boolean {
    if (!this.esValida(fechaActual)) {
      return false;
    }

    this.fechaExpiracion = agregarMinutos(fechaActual, 30);
    return true;
  }

  public invalidar(fechaActual: DateTime = new Date()): void {
    this.activa = false;
    this.fechaExpiracion = fechaActual;
  }

  public toSnapshot(): SesionSnapshot {
    return {
      id: this.id,
      token: this.token,
      fechaInicio: this.fechaInicio.toISOString(),
      fechaExpiracion: this.fechaExpiracion.toISOString(),
      activa: this.activa
    };
  }

  public static fromSnapshot(snapshot: SesionSnapshot): Sesion {
    return new Sesion(
      new Date(snapshot.fechaInicio),
      snapshot.id,
      snapshot.token,
      new Date(snapshot.fechaExpiracion),
      snapshot.activa
    );
  }
}
