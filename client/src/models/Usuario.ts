import { UsuarioSnapshot, UUID } from "../types/domain.js";
import { generarUUID, validarContrasena } from "../utils/domainUtils.js";
import { Sesion } from "./Sesion.js";

export class Usuario {
  public readonly id: UUID;
  public nombre: string;
  public email: string;
  protected password: string;
  public fechaNacimiento: Date;
  public estado: boolean;
  protected sesionActiva: Sesion | null;

  constructor(
    nombre: string,
    email: string,
    password: string,
    fechaNacimiento: Date,
    estado: boolean = false,
    id: UUID = generarUUID()
  ) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.fechaNacimiento = fechaNacimiento;
    this.estado = estado;
    this.sesionActiva = null;
  }

  public registrar(): void {
    validarContrasena(this.password);
    this.estado = true;
  }

  public login(passwordIngresada: string): Sesion {
    if (!this.estado) {
      throw new Error("El usuario no se encuentra registrado o esta inactivo.");
    }

    if (passwordIngresada !== this.password) {
      throw new Error("Credenciales invalidas.");
    }

    if (this.sesionActiva?.esValida()) {
      this.sesionActiva.registrarActividad();
      return this.sesionActiva;
    }

    this.sesionActiva = new Sesion();
    return this.sesionActiva;
  }

  public logout(): void {
    if (this.sesionActiva) {
      this.sesionActiva.invalidar();
      this.sesionActiva = null;
    }
  }

  public obtenerSesionActiva(): Sesion | null {
    if (!this.sesionActiva) {
      return null;
    }

    return this.sesionActiva.esValida() ? this.sesionActiva : null;
  }

  public registrarActividad(): boolean {
    if (!this.sesionActiva) {
      return false;
    }

    return this.sesionActiva.registrarActividad();
  }

  public cambiarContrasena(password: string): void {
    validarContrasena(password);
    this.password = password;
    this.logout();
  }

  public restaurarSesion(sesion: Sesion | null): void {
    this.sesionActiva = sesion;
  }

  public toSnapshot(): UsuarioSnapshot {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      fechaNacimiento: this.fechaNacimiento.toISOString(),
      estado: this.estado,
      sesionActiva: this.sesionActiva?.toSnapshot() ?? null
    };
  }
}
