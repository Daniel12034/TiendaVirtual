const { badRequest, notFound } = require('./HttpError');

async function getProducto(productoId) {
  if (!productoId) {
    throw badRequest('El producto es obligatorio');
  }

  const producto = await Producto.findOne({ id: productoId });

  if (!producto) {
    throw notFound('Producto no encontrado');
  }

  return producto;
}

async function getVariante(varianteId) {
  if (!varianteId) {
    throw badRequest('La variante es obligatoria');
  }

  const variante = await VarianteProducto.findOne({ id: varianteId }).populate('producto');

  if (!variante) {
    throw notFound('Variante no encontrada');
  }

  return variante;
}

async function syncProductEstado(productoId) {
  const producto = await Producto.findOne({ id: productoId });

  if (!producto) {
    return null;
  }

  if (producto.estado === 'INACTIVO') {
    return producto;
  }

  const variantes = await VarianteProducto.find({ producto: productoId });
  const hayStock =
    Number(producto.stock || 0) > 0 ||
    variantes.some((variante) => Number(variante.stock) > 0);
  const nuevoEstado = hayStock ? 'ACTIVO' : 'AGOTADO';

  if (producto.estado !== nuevoEstado) {
    return await Producto.updateOne({ id: productoId }).set({
      estado: nuevoEstado
    });
  }

  return producto;
}

async function validarStock({ productoId, varianteId } = {}, cantidad) {
  const cantidadSolicitada = Number(cantidad);

  if (!Number.isInteger(cantidadSolicitada) || cantidadSolicitada <= 0) {
    throw badRequest('La cantidad debe ser un entero positivo');
  }

  if (varianteId) {
    const variante = await getVariante(varianteId);
    return Number(variante.stock) >= cantidadSolicitada;
  }

  const producto = await getProducto(productoId);
  return Number(producto.stock) >= cantidadSolicitada;
}

async function descontarStock({ productoId, varianteId } = {}, cantidad) {
  const cantidadSolicitada = Number(cantidad);

  if (!Number.isInteger(cantidadSolicitada) || cantidadSolicitada <= 0) {
    throw badRequest('La cantidad debe ser un entero positivo');
  }

  if (varianteId) {
    const variante = await getVariante(varianteId);

    if (Number(variante.stock) < cantidadSolicitada) {
      throw badRequest('Stock insuficiente');
    }

    const updated = await VarianteProducto.updateOne({ id: variante.id }).set({
      stock: Number(variante.stock) - cantidadSolicitada
    });

    await syncProductEstado(variante.producto.id || variante.producto);
    return updated;
  }

  const producto = await getProducto(productoId);

  if (Number(producto.stock) < cantidadSolicitada) {
    throw badRequest('Stock insuficiente');
  }

  const updated = await Producto.updateOne({ id: producto.id }).set({
    stock: Number(producto.stock) - cantidadSolicitada
  });

  await syncProductEstado(producto.id);

  return updated;
}

async function aumentarStock({ productoId, varianteId } = {}, cantidad) {
  const cantidadSolicitada = Number(cantidad);

  if (!Number.isInteger(cantidadSolicitada) || cantidadSolicitada <= 0) {
    throw badRequest('La cantidad debe ser un entero positivo');
  }

  if (varianteId) {
    const variante = await getVariante(varianteId);

    const updated = await VarianteProducto.updateOne({ id: variante.id }).set({
      stock: Number(variante.stock) + cantidadSolicitada
    });

    await syncProductEstado(variante.producto.id || variante.producto);
    return updated;
  }

  const producto = await getProducto(productoId);

  const updated = await Producto.updateOne({ id: producto.id }).set({
    stock: Number(producto.stock) + cantidadSolicitada
  });

  await syncProductEstado(producto.id);

  return updated;
}

async function validarDisponibilidad({ productoId, varianteId } = {}, cantidad) {
  return await validarStock({ productoId, varianteId }, cantidad);
}

async function obtenerPrecioVariante(varianteId) {
  const variante = await getVariante(varianteId);
  return variante.producto?.precio ?? null;
}

module.exports = {
  getProducto,
  getVariante,
  validarStock,
  validarDisponibilidad,
  descontarStock,
  aumentarStock,
  syncProductEstado,
  obtenerPrecioVariante
};
