import { Carrito } from "../models/Carrito.js";
import { Categoria } from "../models/Categoria.js";
import { Cliente } from "../models/Cliente.js";
import { DetallePedido } from "../models/DetallePedido.js";
import { ItemCarrito } from "../models/ItemCarrito.js";
import { Pedido } from "../models/Pedido.js";
import { Producto } from "../models/Producto.js";
import { Sesion } from "../models/Sesion.js";
import { VarianteProducto } from "../models/VarianteProducto.js";
function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}
export class BackendApiService {
    constructor(runtimeState) {
        this.runtimeState = runtimeState;
        this.catalogo = [];
        this.categorias = [];
        this.productosById = new Map();
        this.variantesById = new Map();
        this.categoriasById = new Map();
    }
    async bootstrap() {
        await this.loadCatalog();
    }
    getCatalogo() {
        return [...this.catalogo];
    }
    getCategorias() {
        return [...this.categorias];
    }
    getCategoriaById(categoriaId) {
        return this.categoriasById.get(categoriaId) ?? null;
    }
    getProductoById(productId) {
        return this.productosById.get(productId) ?? null;
    }
    getVarianteById(varianteId) {
        return this.variantesById.get(varianteId) ?? null;
    }
    async getCurrentAuthUser() {
        const authState = this.runtimeState.loadAuthState();
        if (!authState) {
            return null;
        }
        const validation = await this.requestJson(`/api/auth/validate?token=${encodeURIComponent(authState.token)}`);
        if (!validation.authenticated) {
            this.runtimeState.saveAuthState(null);
            return null;
        }
        const payload = await this.requestJson(`/api/clientes/${encodeURIComponent(authState.clienteId)}`);
        return this.mapCliente(payload);
    }
    async loadSession(sessionId) {
        const payload = await this.requestJson(`/api/sesiones/${encodeURIComponent(sessionId)}`);
        return new Sesion(new Date(payload.fecha_inicio), payload.id, payload.token, new Date(payload.fecha_expiracion), payload.estado === "ACTIVA");
    }
    async login(email, password) {
        const payload = await this.requestJson("/api/auth/login", {
            method: "POST",
            json: {
                email,
                password
            }
        });
        this.runtimeState.saveAuthState({
            sessionId: payload.sesion.id,
            token: payload.sesion.token,
            clienteId: payload.cliente.id,
            email: payload.usuario.email
        });
        return this.mapCliente(payload.cliente, payload.usuario, payload.sesion);
    }
    async register(payload) {
        const response = await this.requestJson("/api/auth/register", {
            method: "POST",
            json: {
                nombre: payload.nombre,
                email: payload.email,
                password: payload.password,
                fecha_nacimiento: payload.fechaNacimiento
            }
        });
        this.runtimeState.saveAuthState({
            sessionId: response.sesion.id,
            token: response.sesion.token,
            clienteId: response.cliente.id,
            email: response.usuario.email
        });
        return this.mapCliente(response.cliente, response.usuario, response.sesion);
    }
    async logout() {
        const authState = this.runtimeState.loadAuthState();
        if (authState) {
            await this.requestJson("/api/auth/logout", {
                method: "POST",
                json: {
                    token: authState.token,
                    sessionId: authState.sessionId
                }
            });
        }
        this.runtimeState.saveAuthState(null);
    }
    async loadAuthenticatedCart(usuario) {
        const authState = this.runtimeState.loadAuthState();
        if (!authState) {
            return await this.loadGuestCart();
        }
        const carrito = await this.requestJson(`/api/carritos/cliente/${encodeURIComponent(usuario.id)}`);
        return this.mapCarrito(carrito);
    }
    async loadGuestCart() {
        let guestCartId = this.runtimeState.loadGuestCartId();
        if (!guestCartId) {
            const carrito = await this.requestJson("/api/carritos", {
                method: "POST",
                json: {}
            });
            guestCartId = carrito.id;
            this.runtimeState.saveGuestCartId(guestCartId);
            return this.mapCarrito(carrito);
        }
        try {
            const carrito = await this.requestJson(`/api/carritos/${encodeURIComponent(guestCartId)}/completo`);
            return this.mapCarrito(carrito);
        }
        catch {
            const carrito = await this.requestJson("/api/carritos", {
                method: "POST",
                json: {}
            });
            guestCartId = carrito.id;
            this.runtimeState.saveGuestCartId(guestCartId);
            return this.mapCarrito(carrito);
        }
    }
    async ensureCartForCurrentMode(usuarioActual) {
        if (usuarioActual) {
            return await this.loadAuthenticatedCart(usuarioActual);
        }
        return await this.loadGuestCart();
    }
    async addToCart(input) {
        const authState = this.runtimeState.loadAuthState();
        const payload = {
            productoId: input.productoId,
            cantidad: input.cantidad
        };
        if (input.varianteId) {
            payload.varianteId = input.varianteId;
        }
        if (authState && input.usuarioActual) {
            payload.clienteId = input.usuarioActual.id;
        }
        else {
            const guestCart = await this.loadGuestCart();
            payload.carritoId = guestCart.id;
        }
        await this.requestJson("/api/carritos/agregar-producto", {
            method: "POST",
            json: payload
        });
        return await this.ensureCartForCurrentMode(input.usuarioActual);
    }
    async updateCartItemQuantity(input) {
        await this.requestJson(`/api/items-carrito/${encodeURIComponent(input.itemId)}`, {
            method: "PUT",
            json: {
                cantidad: input.cantidad
            }
        });
        return await this.ensureCartForCurrentMode(input.usuarioActual);
    }
    async removeCartItem(input) {
        await this.requestJson(`/api/carritos/items/${encodeURIComponent(input.itemId)}`, {
            method: "DELETE"
        });
        return await this.ensureCartForCurrentMode(input.usuarioActual);
    }
    async checkout(cliente) {
        const payload = await this.requestJson("/api/pedidos/generar-desde-carrito", {
            method: "POST",
            json: {
                clienteId: cliente.id
            }
        });
        return this.mapPedido(payload);
    }
    async loadRecoveryInbox(email) {
        const recoveries = await this.requestJson(`/api/recuperaciones?email=${encodeURIComponent(email)}`);
        return recoveries
            .slice()
            .sort((left, right) => new Date(right.fecha_solicitud).getTime() -
            new Date(left.fecha_solicitud).getTime())
            .slice(0, 6)
            .map((request) => ({
            id: request.id,
            email: request.email,
            expiresAt: new Date(request.fecha_expiracion),
            resetPath: `#/reset/${request.token}`,
            status: request.estado === "USADA"
                ? "used"
                : request.estado === "EXPIRADA"
                    ? "expired"
                    : "pending"
        }));
    }
    async requestPasswordRecovery(payload) {
        await this.requestJson("/api/recuperaciones/solicitar", {
            method: "POST",
            json: payload
        });
        return await this.loadRecoveryInbox(payload.email);
    }
    async getRecoveryByToken(token) {
        const recovery = await this.requestJson(`/api/recuperaciones/${encodeURIComponent(token)}`);
        const status = recovery.estado === "USADA"
            ? "used"
            : recovery.estado === "EXPIRADA"
                ? "expired"
                : "valid";
        return {
            email: recovery.email,
            expiresAt: new Date(recovery.fecha_expiracion),
            status
        };
    }
    async resetPassword(token, payload) {
        await this.requestJson(`/api/recuperaciones/${encodeURIComponent(token)}/restablecer`, {
            method: "POST",
            json: payload
        });
    }
    async mergeGuestCartIntoClient(clientId) {
        const guestCartId = this.runtimeState.loadGuestCartId();
        if (!guestCartId) {
            return;
        }
        let guestCart;
        try {
            guestCart = this.mapCarrito(await this.requestJson(`/api/carritos/${encodeURIComponent(guestCartId)}/completo`));
        }
        catch {
            this.runtimeState.saveGuestCartId(null);
            return;
        }
        const currentClientCart = await this.requestJson(`/api/carritos/cliente/${encodeURIComponent(clientId)}`);
        const targetCartId = currentClientCart.id;
        for (const item of guestCart.obtenerItems()) {
            try {
                await this.requestJson("/api/carritos/agregar-producto", {
                    method: "POST",
                    json: {
                        clienteId: clientId,
                        productoId: item.producto.id,
                        varianteId: item.variante?.id ?? undefined,
                        cantidad: item.cantidad
                    }
                });
            }
            catch {
                continue;
            }
        }
        await this.requestJson(`/api/carritos/${encodeURIComponent(guestCartId)}/vaciar`, {
            method: "DELETE",
            json: {
                carritoId: guestCartId
            }
        }).catch(() => undefined);
        this.runtimeState.saveGuestCartId(null);
        await this.requestJson(`/api/carritos/${encodeURIComponent(targetCartId)}/completo`);
    }
    async loadCatalog() {
        const [categorias, productos] = await Promise.all([
            this.requestJson("/api/categorias"),
            this.requestJson("/api/productos")
        ]);
        this.productosById.clear();
        this.variantesById.clear();
        this.categoriasById.clear();
        const categoriaEntities = categorias.map((categoria) => {
            const productosDeCategoria = productos.filter((producto) => this.resolveCategoriaId(producto.categoria) === categoria.id);
            const productosModel = productosDeCategoria.map((producto) => this.mapProducto(producto));
            const categoriaEntity = new Categoria(categoria.nombre, categoria.descripcion ?? "", productosModel, categoria.id);
            this.categoriasById.set(categoria.id, categoriaEntity);
            return categoriaEntity;
        });
        const catalogo = productos
            .map((producto) => {
            const productoModel = this.mapProducto(producto);
            const categoriaEntity = this.categoriasById.get(this.resolveCategoriaId(producto.categoria)) ?? null;
            if (!categoriaEntity) {
                return null;
            }
            return {
                producto: productoModel,
                categoria: categoriaEntity,
                imagenUrl: productoModel.imagenUrl,
                imagenAlt: producto.imagen_alt ?? producto.nombre,
                etiqueta: producto.etiqueta ?? "",
                imagenMeta: {
                    sourceName: producto.imagen_source_name ?? "",
                    sourcePageUrl: producto.imagen_source_page_url ?? "",
                    creatorName: producto.imagen_creator_name ?? "",
                    creatorUrl: producto.imagen_creator_url ?? null,
                    licenseLabel: producto.imagen_license_label ?? "",
                    width: Number(producto.imagen_width ?? 0),
                    height: Number(producto.imagen_height ?? 0),
                    verifiedRealPhoto: Boolean(producto.imagen_verified_real_photo),
                    verifiedHd: Boolean(producto.imagen_verified_hd)
                }
            };
        })
            .filter((entry) => Boolean(entry));
        this.categorias = categoriaEntities;
        this.catalogo = catalogo;
    }
    mapProducto(apiProducto) {
        const variantes = (apiProducto.variantes ?? []).map((variante) => this.mapVariante(variante));
        const producto = new Producto(apiProducto.nombre, apiProducto.descripcion ?? "", Number(apiProducto.precio), apiProducto.estado === "ACTIVO", Number(apiProducto.stock ?? 0), variantes, apiProducto.id, apiProducto.imagen_url ?? "");
        this.productosById.set(producto.id, producto);
        return producto;
    }
    mapVariante(apiVariante) {
        const variante = new VarianteProducto(apiVariante.nombre, apiVariante.valor, Number(apiVariante.stock ?? 0), apiVariante.id);
        this.variantesById.set(variante.id, variante);
        return variante;
    }
    mapCarrito(apiCarrito) {
        const items = (apiCarrito.items ?? []).map((item) => {
            const producto = this.getOrBuildProducto(item.producto);
            const variante = item.variante ? this.getOrBuildVariante(item.variante) : undefined;
            return new ItemCarrito(producto, Number(item.cantidad), variante, Number(item.precio_unitario), item.id);
        });
        return new Carrito(apiCarrito.fecha_creacion ? new Date(apiCarrito.fecha_creacion) : new Date(), items, apiCarrito.id);
    }
    mapPedido(apiPedido) {
        const detalles = (apiPedido.detalles ?? []).map((detalle) => new DetallePedido(Number(detalle.cantidad), Number(detalle.precio_unitario), typeof detalle.producto === "string"
            ? this.getProductoById(detalle.producto)?.nombre ?? detalle.producto
            : detalle.producto.nombre, detalle.variante
            ? typeof detalle.variante === "string"
                ? this.getVarianteById(detalle.variante)?.valor ?? detalle.variante
                : `${detalle.variante.nombre}: ${detalle.variante.valor}`
            : undefined));
        return new Pedido(new Date(apiPedido.fecha), Number(apiPedido.total), detalles, apiPedido.id);
    }
    mapCliente(apiCliente, apiUsuario, sesion) {
        const usuario = typeof apiCliente.usuario === "string"
            ? apiUsuario
            : apiCliente.usuario;
        if (!usuario) {
            throw new Error("No se pudo reconstruir el usuario autenticado.");
        }
        const pedidos = (apiCliente.pedidos ?? []).map((pedido) => this.mapPedido(pedido));
        const cliente = new Cliente(usuario.nombre, usuario.email, "", usuario.fecha_nacimiento
            ? new Date(usuario.fecha_nacimiento)
            : new Date(), usuario.estado === "ACTIVO", pedidos, apiCliente.id);
        if (sesion) {
            cliente.restaurarSesion(new Sesion(new Date(sesion.fecha_inicio), sesion.id, sesion.token, new Date(sesion.fecha_expiracion), sesion.estado === "ACTIVA"));
        }
        return cliente;
    }
    getOrBuildProducto(apiProducto) {
        if (typeof apiProducto === "string") {
            const existing = this.productosById.get(apiProducto);
            if (existing) {
                return existing;
            }
            return new Producto(apiProducto, "", 0, false, 0, [], apiProducto, "");
        }
        const existing = this.productosById.get(apiProducto.id);
        if (existing) {
            return existing;
        }
        return this.mapProducto(apiProducto);
    }
    getOrBuildVariante(apiVariante) {
        if (typeof apiVariante === "string") {
            const existing = this.variantesById.get(apiVariante);
            if (existing) {
                return existing;
            }
            return new VarianteProducto(apiVariante, apiVariante, 0, apiVariante);
        }
        const existing = this.variantesById.get(apiVariante.id);
        if (existing) {
            return existing;
        }
        return this.mapVariante(apiVariante);
    }
    resolveCategoriaId(categoria) {
        return typeof categoria === "string" ? categoria : categoria.id;
    }
    async requestJson(url, init = {}) {
        const headers = new Headers(init.headers);
        if (init.json !== undefined) {
            headers.set("Content-Type", "application/json");
        }
        const response = await fetch(url, {
            ...init,
            headers,
            body: init.json !== undefined ? JSON.stringify(init.json) : init.body
        });
        const text = await response.text();
        let data = null;
        if (text) {
            try {
                data = JSON.parse(text);
            }
            catch {
                data = text;
            }
        }
        if (!response.ok) {
            const message = typeof data === "object" && data !== null
                ? data.error ||
                    data.message ||
                    `La peticion fallo con estado ${response.status}`
                : typeof data === "string" && data
                    ? data
                    : `La peticion fallo con estado ${response.status}`;
            throw new Error(message);
        }
        return data;
    }
}
