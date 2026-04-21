import { agregarMinutos, generarUUID } from "../utils/domainUtils.js";
export class Sesion {
    constructor(fechaInicio = new Date(), id = generarUUID(), token = generarUUID(), fechaExpiracion = agregarMinutos(fechaInicio, 30), activa = true) {
        this.id = id;
        this.token = token;
        this.fechaInicio = fechaInicio;
        this.fechaExpiracion = fechaExpiracion;
        this.activa = activa;
    }
    esValida(fechaActual = new Date()) {
        if (!this.activa) {
            return false;
        }
        if (fechaActual.getTime() > this.fechaExpiracion.getTime()) {
            this.invalidar(fechaActual);
            return false;
        }
        return true;
    }
    registrarActividad(fechaActual = new Date()) {
        if (!this.esValida(fechaActual)) {
            return false;
        }
        this.fechaExpiracion = agregarMinutos(fechaActual, 30);
        return true;
    }
    invalidar(fechaActual = new Date()) {
        this.activa = false;
        this.fechaExpiracion = fechaActual;
    }
    toSnapshot() {
        return {
            id: this.id,
            token: this.token,
            fechaInicio: this.fechaInicio.toISOString(),
            fechaExpiracion: this.fechaExpiracion.toISOString(),
            activa: this.activa
        };
    }
    static fromSnapshot(snapshot) {
        return new Sesion(new Date(snapshot.fechaInicio), snapshot.id, snapshot.token, new Date(snapshot.fechaExpiracion), snapshot.activa);
    }
}
