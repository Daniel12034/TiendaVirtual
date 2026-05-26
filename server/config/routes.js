module.exports.routes = {

  // =====================================================
  // AUTH
  // =====================================================

  'POST /api/auth/register': {
    action: 'usuario/register'
  },

  'POST /api/auth/login': {
    action: 'usuario/login'
  },

  'POST /api/auth/logout': {
    action: 'usuario/logout'
  },

  // =====================================================
  // USUARIOS
  // =====================================================

  'GET /api/usuarios': 'UsuarioController.find',
  'GET /api/usuarios/:id': 'UsuarioController.findOne',
  'POST /api/usuarios': 'UsuarioController.create',
  'PUT /api/usuarios/:id': 'UsuarioController.update',
  'DELETE /api/usuarios/:id': 'UsuarioController.destroy',

  // =====================================================
  // SESIONES
  // =====================================================

  'GET /api/sesiones': 'SesionController.find',
  'GET /api/sesiones/:id': 'SesionController.findOne',
  'POST /api/sesiones': 'SesionController.create',
  'PUT /api/sesiones/:id': 'SesionController.update',
  'DELETE /api/sesiones/:id': 'SesionController.destroy',

  // =====================================================
  // CLIENTES
  // =====================================================

  'GET /api/clientes': 'ClienteController.find',
  'GET /api/clientes/:id': 'ClienteController.findOne',
  'POST /api/clientes': 'ClienteController.create',
  'PUT /api/clientes/:id': 'ClienteController.update',
  'DELETE /api/clientes/:id': 'ClienteController.destroy',

  // =====================================================
  // CATEGORIAS
  // =====================================================

  'GET /api/categorias': 'CategoriaController.find',
  'GET /api/categorias/:id': 'CategoriaController.findOne',
  'POST /api/categorias': 'CategoriaController.create',
  'PUT /api/categorias/:id': 'CategoriaController.update',
  'DELETE /api/categorias/:id': 'CategoriaController.destroy',

  // =====================================================
  // PRODUCTOS
  // =====================================================

  'GET /api/productos': 'ProductoController.find',
  'GET /api/productos/:id': 'ProductoController.findOne',
  'POST /api/productos': 'ProductoController.create',
  'PUT /api/productos/:id': 'ProductoController.update',
  'DELETE /api/productos/:id': 'ProductoController.destroy',

  // =====================================================
  // VARIANTES
  // =====================================================

  'GET /api/variantes': 'VarianteProductoController.find',
  'GET /api/variantes/:id': 'VarianteProductoController.findOne',
  'POST /api/variantes': 'VarianteProductoController.create',
  'PUT /api/variantes/:id': 'VarianteProductoController.update',
  'DELETE /api/variantes/:id': 'VarianteProductoController.destroy',

  // =====================================================
  // CARRITO
  // =====================================================

  'GET /api/carritos': 'CarritoController.find',
  'GET /api/carritos/:id': 'CarritoController.findOne',
  'POST /api/carritos': 'CarritoController.create',
  'PUT /api/carritos/:id': 'CarritoController.update',
  'DELETE /api/carritos/:id': 'CarritoController.destroy',

  // =====================================================
  // ITEM CARRITO
  // =====================================================

  'GET /api/items-carrito': 'ItemCarritoController.find',
  'GET /api/items-carrito/:id': 'ItemCarritoController.findOne',
  'POST /api/items-carrito': 'ItemCarritoController.create',
  'PUT /api/items-carrito/:id': 'ItemCarritoController.update',
  'DELETE /api/items-carrito/:id': 'ItemCarritoController.destroy',

  // =====================================================
  // PEDIDOS
  // =====================================================

  'GET /api/pedidos': 'PedidoController.find',
  'GET /api/pedidos/:id': 'PedidoController.findOne',
  'POST /api/pedidos': 'PedidoController.create',
  'PUT /api/pedidos/:id': 'PedidoController.update',
  'DELETE /api/pedidos/:id': 'PedidoController.destroy',

  // =====================================================
  // DETALLE PEDIDO
  // =====================================================

  'GET /api/detalles-pedido': 'DetallePedidoController.find',
  'GET /api/detalles-pedido/:id': 'DetallePedidoController.findOne',
  'POST /api/detalles-pedido': 'DetallePedidoController.create',
  'PUT /api/detalles-pedido/:id': 'DetallePedidoController.update',
  'DELETE /api/detalles-pedido/:id': 'DetallePedidoController.destroy',

  // =====================================================
  // CARRITO ACCIONES
  // =====================================================

  'POST /api/carrito/agregar-producto': {
    action: 'carrito/agregar-producto'
  },

  'DELETE /api/carrito/eliminar-producto/:itemId': {
    action: 'carrito/eliminar-producto'
  },

  'DELETE /api/carrito/vaciar/:carritoId': {
    action: 'carrito/vaciar'
  },

  'GET /api/carrito/calcular-total/:carritoId': {
    action: 'carrito/calcular-total'
  },

  // =====================================================
  // PEDIDOS ACCIONES
  // =====================================================

  'POST /api/pedido/generar-desde-carrito': {
    action: 'pedido/generar-desde-carrito'
  },

  'POST /api/pedido/confirmar/:pedidoId': {
    action: 'pedido/confirmar'
  },

  'POST /api/pedido/cancelar/:pedidoId': {
    action: 'pedido/cancelar'
  },

  // =====================================================
  // INVENTARIO
  // =====================================================

  'POST /api/inventario/aumentar-stock': {
    action: 'inventario/aumentar-stock'
  },

  'POST /api/inventario/descontar-stock': {
    action: 'inventario/descontar-stock'
  },

  'POST /api/inventario/validar-disponibilidad': {
    action: 'inventario/validar-disponibilidad'
  }

};