const { v4: uuidv4 } = require('uuid');
const { badRequest, notFound } = require('./HttpError');
const InventoryService = require('./InventoryService');

async function findCarritoByReference({ clienteId, carritoId }) {
  if (carritoId) {
    const carrito = await Carrito.findOne({ id: carritoId });

    if (carrito) {
      return carrito;
    }
  }

  if (clienteId) {
    return await Carrito.findOne({ cliente: clienteId });
  }

  return null;
}

async function obtenerCarritoCliente(clienteId) {
  if (!clienteId) {
    throw badRequest('El cliente es obligatorio');
  }

  let carrito = await Carrito.findOne({ cliente: clienteId });

  if (!carrito) {
    carrito = await Carrito.create({
      id: uuidv4(),
      cliente: clienteId
    }).fetch();

    try {
      await Cliente.updateOne({ id: clienteId }).set({
        carrito: carrito.id
      });
    } catch (error) {
      await Carrito.destroyOne({ id: carrito.id });
      throw error;
    }
  }

  const items = await ItemCarrito.find({ carrito: carrito.id }).populate('producto').populate('variante');

  return {
    ...carrito,
    items
  };
}

async function obtenerCarrito({ clienteId, carritoId }) {
  const carrito = await findCarritoByReference({ clienteId, carritoId });

  if (!carrito) {
    throw notFound('Carrito no encontrado');
  }

  const items = await ItemCarrito.find({ carrito: carrito.id }).populate('producto').populate('variante');

  return {
    ...carrito,
    items
  };
}

async function obtenerOCrearCarrito({ clienteId, carritoId }) {
  const existente = await findCarritoByReference({ clienteId, carritoId });

  if (existente) {
    return existente;
  }

  if (clienteId) {
    return await obtenerCarritoCliente(clienteId);
  }

  const nuevoCarrito = await Carrito.create({
    id: uuidv4()
  }).fetch();

  return nuevoCarrito;
}

async function agregarProducto({
  clienteId,
  carritoId,
  productoId,
  varianteId,
  cantidad = 1
}) {
  const cantidadSolicitada = Number(cantidad);

  if (!Number.isInteger(cantidadSolicitada) || cantidadSolicitada <= 0) {
    throw badRequest('La cantidad debe ser un entero positivo');
  }

  if (!productoId) {
    throw badRequest('El producto es obligatorio');
  }

  const carrito = await obtenerOCrearCarrito({ clienteId, carritoId });
  const producto = await InventoryService.getProducto(productoId);
  const variante = varianteId ? await InventoryService.getVariante(varianteId) : null;
  const itemExistente = await ItemCarrito.findOne({
    carrito: carrito.id,
    producto: producto.id,
    variante: variante?.id || null
  });
  const cantidadTotal = (itemExistente ? Number(itemExistente.cantidad) : 0) + cantidadSolicitada;

  if (!(await InventoryService.validarStock({ productoId: producto.id, varianteId: variante?.id }, cantidadTotal))) {
    throw badRequest('Stock insuficiente para agregar el producto al carrito');
  }

  if (itemExistente) {
    return await ItemCarrito.updateOne({ id: itemExistente.id }).set({
      cantidad: cantidadTotal,
      precio_unitario: Number(producto.precio ?? 0)
    });
  }

  return await ItemCarrito.create({
    id: uuidv4(),
    cantidad: cantidadSolicitada,
    precio_unitario: Number(producto.precio ?? 0),
    carrito: carrito.id,
    producto: producto.id,
    variante: variante?.id || null
  }).fetch();
}

async function eliminarProducto(itemId) {
  if (!itemId) {
    throw badRequest('El item es obligatorio');
  }

  const item = await ItemCarrito.destroyOne({ id: itemId });

  if (!item) {
    throw notFound('El item no existe en el carrito');
  }

  return item;
}

async function vaciarCarrito(carritoId) {
  if (!carritoId) {
    throw badRequest('El carrito es obligatorio');
  }

  await ItemCarrito.destroy({
    carrito: carritoId
  });

  return true;
}

async function calcularTotal(carritoId) {
  const items = await ItemCarrito.find({
    carrito: carritoId
  });

  const total = items.reduce(
    (total, item) => total + Number(item.cantidad) * Number(item.precio_unitario),
    0
  );

  return Math.round((total + Number.EPSILON) * 100) / 100;
}

module.exports = {
  obtenerCarritoCliente,
  obtenerCarrito,
  agregarProducto,
  eliminarProducto,
  vaciarCarrito,
  calcularTotal
};
