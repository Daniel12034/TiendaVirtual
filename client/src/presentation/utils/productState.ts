import { Producto } from "../../models/Producto.js";
import { VarianteProducto } from "../../models/VarianteProducto.js";

export function obtenerVariantes(producto: Producto): VarianteProducto[] {
  return producto.obtenerVariantes();
}

export function primeraVarianteDisponible(
  producto: Producto
): VarianteProducto | undefined {
  return obtenerVariantes(producto).find((variante) => variante.disponible());
}

export function productoTieneStock(producto: Producto): boolean {
  const variantes = obtenerVariantes(producto);

  if (variantes.length > 0) {
    return variantes.some((variante) => variante.disponible());
  }

  return producto.estaDisponible();
}

export function resumenStockProducto(producto: Producto): string {
  const variantes = obtenerVariantes(producto);

  if (variantes.length === 0) {
    const stock = producto.obtenerStock();
    return stock > 0 ? `${stock} unidad(es) disponibles` : "Sin stock";
  }

  const variantesDisponibles = variantes.filter((variante) => variante.disponible());

  if (variantesDisponibles.length === 0) {
    return "Todas las variantes estan agotadas";
  }

  return `${variantesDisponibles.length}/${variantes.length} variantes con stock`;
}
