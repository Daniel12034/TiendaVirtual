import { generarUUID, validarContrasena } from "../utils/domainUtils.js";
import { Sesion } from "./Sesion.js";
export class Usuario {
    constructor(nombre, email, password, fechaNacimiento, estado = false, id = generarUUID()) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.fechaNacimiento = fechaNacimiento;
        this.estado = estado;
        this.sesionActiva = null;
    }
    registrar() {
        validarContrasena(this.password);
        this.estado = true;
    }
    login(passwordIngresada) {
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
    logout() {
        if (this.sesionActiva) {
            this.sesionActiva.invalidar();
            this.sesionActiva = null;
        }
    }
    obtenerSesionActiva() {
        if (!this.sesionActiva) {
            return null;
        }
        return this.sesionActiva.esValida() ? this.sesionActiva : null;
    }
    registrarActividad() {
        if (!this.sesionActiva) {
            return false;
        }
        return this.sesionActiva.registrarActividad();
    }
    cambiarContrasena(password) {
        validarContrasena(password);
        this.password = password;
        this.logout();
    }
    restaurarSesion(sesion) {
        this.sesionActiva = sesion;
    }
    toSnapshot() {
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
