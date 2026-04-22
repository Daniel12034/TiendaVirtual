import { DateTime, Integer, UUID } from "../types/domain.js";

export function generarUUID(): UUID {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function redondearMoneda(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function validarContrasena(password: string): void {
  if (password.trim().length < 8) {
    throw new Error("La contrasena debe tener al menos 8 caracteres.");
  }
}

export function validarEnteroPositivo(valor: number, campo: string): void {
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new Error(`${campo} debe ser un entero positivo.`);
  }
}

export function validarEnteroNoNegativo(valor: number, campo: string): void {
  if (!Number.isInteger(valor) || valor < 0) {
    throw new Error(`${campo} debe ser un entero no negativo.`);
  }
}

export function validarDecimalNoNegativo(valor: number, campo: string): void {
  if (Number.isNaN(valor) || valor < 0) {
    throw new Error(`${campo} debe ser un decimal no negativo.`);
  }
}

export function agregarMinutos(fecha: DateTime, minutos: Integer): DateTime {
  return new Date(fecha.getTime() + minutos * 60_000);
}
