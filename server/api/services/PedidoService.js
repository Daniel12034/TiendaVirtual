const { v4: uuidv4 } = require('uuid');
const { badRequest, conflict, notFound } = require('./HttpError');
const CartService = require('./CartService');
const InventoryService = require('./InventoryService');

function calcularSubtotal(cantidad, precio_unitario) {
  return Number(cantidad) * Number(precio_unitario);
}

function calcularTotal(items) {
  const total = items.reduce(
    (total, item) => total + calcularSubtotal(item.cantidad, item.precio_unitario),
    0
  );

  return Math.round((total + Number.EPSILON) * 100) / 100;
}

async function getPedidoConDetalles(pedidoId) {
  const pedido = await Pedido.findOne({ id: pedidoId });

  if (!pedido) {
    throw notFound('Pedido no encontrado');
  }

  const detalles = await DetallePedido.find({ pedido: pedido.id });

  return {
    ...pedido,
    detalles
  };
}

async function generarPedidoDesdeCarrito(clienteId) {
  if (!clienteId) {
    throw badRequest('El cliente es obligatorio');
  }

  const carrito = await CartService.obtenerCarritoCliente(clienteId);
  const items = await ItemCarrito.find({ carrito: carrito.id });

  if (items.length === 0) {
    throw badRequest('No se puede generar un pedido desde un carrito vacio');
  }

  const variantes = [];

  for (const item of items) {
    const producto = await Producto.findOne({ id: item.producto });
    const variante = item.variante
      ? await VarianteProducto.findOne({ id: item.variante }).populate('producto')
      : null;

    if (!producto) {
      throw notFound('Uno de los productos del carrito no existe');
    }

    const disponible = await InventoryService.validarStock(
      { productoId: producto.id, varianteId: variante?.id || null },
      item.cantidad
    );

    if (!disponible) {
      throw conflict(
        `Stock insuficiente para el producto ${producto.nombre}`
      );
    }

    variantes.push({ item, variante, producto });
  }

  const pedido = await Pedido.create({
    id: uuidv4(),
    fecha: new Date(),
    total: calcularTotal(items),
    estado: 'PENDIENTE',
    cliente: clienteId
  }).fetch();

  const detalles = [];
  const stockAplicado = [];

  try {
    for (const { item, variante, producto } of variantes) {
      const detalle = await DetallePedido.create({
        id: uuidv4(),
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        producto: item.producto,
        pedido: pedido.id,
        variante: variante?.id || null
      }).fetch();

      detalles.push(detalle);
      await InventoryService.descontarStock(
        { productoId: producto.id, varianteId: variante?.id || null },
        item.cantidad
      );
      stockAplicado.push({
        productoId: producto.id,
        varianteId: variante?.id || null,
        cantidad: item.cantidad
      });
    }

    await CartService.vaciarCarrito(carrito.id);

    return {
      ...pedido,
      detalles
    };
  } catch (error) {
    for (const { productoId, varianteId, cantidad } of stockAplicado) {
      await InventoryService.aumentarStock({ productoId, varianteId }, cantidad);
    }

    if (detalles.length > 0) {
      await DetallePedido.destroy({
        id: { in: detalles.map((detalle) => detalle.id) }
      });
    }

    await Pedido.destroyOne({ id: pedido.id });
    throw error;
  }
}

async function confirmarPedido(pedidoId) {
  const pedido = await getPedidoConDetalles(pedidoId);

  if (pedido.estado === 'CANCELADO') {
    throw conflict('No se puede confirmar un pedido cancelado');
  }

  if (pedido.estado === 'ENTREGADO') {
    throw conflict('El pedido ya fue entregado');
  }

  if (pedido.estado === 'PAGADO') {
    return pedido;
  }

  return await Pedido.updateOne({ id: pedido.id }).set({
    estado: 'PAGADO'
  });
}

async function cancelarPedido(pedidoId) {
  const pedido = await getPedidoConDetalles(pedidoId);

  if (pedido.estado === 'CANCELADO') {
    return pedido;
  }

  if (pedido.estado === 'ENTREGADO') {
    throw conflict('No se puede cancelar un pedido entregado');
  }

  for (const detalle of pedido.detalles) {
    await InventoryService.aumentarStock(
      { productoId: detalle.producto, varianteId: detalle.variante },
      detalle.cantidad
    );
  }

  return await Pedido.updateOne({ id: pedido.id }).set({
    estado: 'CANCELADO'
  });
}

module.exports = {
  calcularSubtotal,
  calcularTotal,
  getPedidoConDetalles,
  generarPedidoDesdeCarrito,
  confirmarPedido,
  cancelarPedido
};
