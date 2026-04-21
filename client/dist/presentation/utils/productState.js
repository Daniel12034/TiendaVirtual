export function obtenerVariantes(producto) {
    return producto.obtenerVariantes();
}
export function primeraVarianteDisponible(producto) {
    return obtenerVariantes(producto).find((variante) => variante.disponible());
}
export function productoTieneStock(producto) {
    const variantes = obtenerVariantes(producto);
    if (variantes.length > 0) {
        return variantes.some((variante) => variante.disponible());
    }
    return producto.estaDisponible();
}
export function resumenStockProducto(producto) {
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
