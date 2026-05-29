import { Carrito } from "../models/Carrito.js";
import { Categoria } from "../models/Categoria.js";
import { Cliente } from "../models/Cliente.js";
import { DetallePedido } from "../models/DetallePedido.js";
import { ItemCarrito } from "../models/ItemCarrito.js";
import { Pedido } from "../models/Pedido.js";
import { Producto } from "../models/Producto.js";
import { Sesion } from "../models/Sesion.js";
import { VarianteProducto } from "../models/VarianteProducto.js";
import { CatalogoEntry, RecoveryInboxItem } from "../presentation/types.js";
import { RuntimeAuthState } from "./RuntimeStateService.js";

interface ApiResponseInit extends RequestInit {
  json?: unknown;
}

interface ApiCategoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  productos?: ApiProducto[];
}

interface ApiProducto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  etiqueta: string | null;
  imagen_url: string | null;
  imagen_alt: string | null;
  imagen_source_name: string | null;
  imagen_source_page_url: string | null;
  imagen_creator_name: string | null;
  imagen_creator_url: string | null;
  imagen_license_label: string | null;
  imagen_width: number | null;
  imagen_height: number | null;
  imagen_verified_real_photo: boolean;
  imagen_verified_hd: boolean;
  estado: "ACTIVO" | "INACTIVO" | "AGOTADO";
  categoria: ApiCategoria | string;
  variantes?: ApiVariante[];
}

interface ApiVariante {
  id: string;
  nombre: string;
  valor: string;
  stock: number;
  producto?: ApiProducto | string;
}

interface ApiUsuario {
  id: string;
  nombre: string;
  email: string;
  fecha_nacimiento: string | null;
  estado: string;
}

interface ApiSesion {
  id: string;
  token: string;
  fecha_inicio: string;
  fecha_expiracion: string;
  estado: string;
  usuario: string | ApiUsuario;
}

interface ApiCliente {
  id: string;
  telefono: string | null;
  direccion: string | null;
  usuario: ApiUsuario | string;
  carrito?: ApiCarrito | null;
  pedidos?: ApiPedido[];
}

interface ApiCarrito {
  id: string;
  fecha_creacion: string | null;
  cliente?: string | ApiCliente | null;
  items?: ApiItemCarrito[];
}

interface ApiItemCarrito {
  id: string;
  cantidad: number;
  precio_unitario: number;
  producto: ApiProducto | string;
  variante?: ApiVariante | null;
  carrito?: string | ApiCarrito | null;
}

interface ApiPedido {
  id: string;
  fecha: string;
  total: number;
  estado: string;
  cliente?: string | ApiCliente;
  detalles?: ApiDetallePedido[];
}

interface ApiDetallePedido {
  id: string;
  cantidad: number;
  precio_unitario: number;
  producto: ApiProducto | string;
  variante?: ApiVariante | null;
  pedido?: string | ApiPedido;
}

interface ApiRecoveryRecord {
  id: string;
  email: string;
  token: string;
  fecha_solicitud: string;
  fecha_expiracion: string;
  fecha_consumo: string | null;
  estado: "PENDIENTE" | "EXPIRADA" | "USADA";
}

interface ApiAuthPayload {
  usuario: ApiUsuario;
  cliente: ApiCliente;
  sesion: ApiSesion;
}

interface ApiRecoveryRequestPayload {
  email: string;
}

interface ApiPasswordResetPayload {
  password: string;
  confirmPassword: string;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export class BackendApiService {
  private catalogo: CatalogoEntry[] = [];
  private categorias: Categoria[] = [];
  private readonly productosById = new Map<string, Producto>();
  private readonly variantesById = new Map<string, VarianteProducto>();
  private readonly categoriasById = new Map<string, Categoria>();

  constructor(private readonly runtimeState: {
    loadAuthState(): RuntimeAuthState | null;
    saveAuthState(state: RuntimeAuthState | null): void;
    loadGuestCartId(): string | null;
    saveGuestCartId(cartId: string | null): void;
  }) {}

  public async bootstrap(): Promise<void> {
    await this.loadCatalog();
  }

  public getCatalogo(): CatalogoEntry[] {
    return [...this.catalogo];
  }

  public getCategorias(): Categoria[] {
    return [...this.categorias];
  }

  public getCategoriaById(categoriaId: string): Categoria | null {
    return this.categoriasById.get(categoriaId) ?? null;
  }

  public getProductoById(productId: string): Producto | null {
    return this.productosById.get(productId) ?? null;
  }

  public getVarianteById(varianteId: string): VarianteProducto | null {
    return this.variantesById.get(varianteId) ?? null;
  }

  public async getCurrentAuthUser(): Promise<Cliente | null> {
    const authState = this.runtimeState.loadAuthState();

    if (!authState) {
      return null;
    }

    const validation = await this.requestJson<{ authenticated: boolean }>(
      `/api/auth/validate?token=${encodeURIComponent(authState.token)}`
    );

    if (!validation.authenticated) {
      this.runtimeState.saveAuthState(null);
      return null;
    }

    const payload = await this.requestJson<ApiCliente>(
      `/api/clientes/${encodeURIComponent(authState.clienteId)}`
    );

    return this.mapCliente(payload);
  }

  public async loadSession(sessionId: string): Promise<Sesion> {
    const payload = await this.requestJson<ApiSesion>(
      `/api/sesiones/${encodeURIComponent(sessionId)}`
    );

    return new Sesion(
      new Date(payload.fecha_inicio),
      payload.id,
      payload.token,
      new Date(payload.fecha_expiracion),
      payload.estado === "ACTIVA"
    );
  }

  public async login(email: string, password: string): Promise<Cliente> {
    const payload = await this.requestJson<ApiAuthPayload>("/api/auth/login", {
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

  public async register(payload: {
    nombre: string;
    email: string;
    password: string;
    fechaNacimiento: string;
  }): Promise<Cliente> {
    const response = await this.requestJson<ApiAuthPayload>("/api/auth/register", {
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

  public async logout(): Promise<void> {
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

  public async loadAuthenticatedCart(usuario: Cliente): Promise<Carrito> {
    const authState = this.runtimeState.loadAuthState();

    if (!authState) {
      return await this.loadGuestCart();
    }

    const carrito = await this.requestJson<ApiCarrito>(
      `/api/carritos/cliente/${encodeURIComponent(usuario.id)}`
    );

    return this.mapCarrito(carrito);
  }

  public async loadGuestCart(): Promise<Carrito> {
    let guestCartId = this.runtimeState.loadGuestCartId();

    if (!guestCartId) {
      const carrito = await this.requestJson<ApiCarrito>("/api/carritos", {
        method: "POST",
        json: {}
      });

      guestCartId = carrito.id;
      this.runtimeState.saveGuestCartId(guestCartId);
      return this.mapCarrito(carrito);
    }

    try {
      const carrito = await this.requestJson<ApiCarrito>(
        `/api/carritos/${encodeURIComponent(guestCartId)}/completo`
      );
      return this.mapCarrito(carrito);
    } catch {
      const carrito = await this.requestJson<ApiCarrito>("/api/carritos", {
        method: "POST",
        json: {}
      });
      guestCartId = carrito.id;
      this.runtimeState.saveGuestCartId(guestCartId);
      return this.mapCarrito(carrito);
    }
  }

  public async ensureCartForCurrentMode(usuarioActual: Cliente | null): Promise<Carrito> {
    if (usuarioActual) {
      return await this.loadAuthenticatedCart(usuarioActual);
    }

    return await this.loadGuestCart();
  }

  public async addToCart(input: {
    usuarioActual: Cliente | null;
    productoId: string;
    varianteId?: string | null;
    cantidad: number;
  }): Promise<Carrito> {
    const authState = this.runtimeState.loadAuthState();
    const payload: Record<string, unknown> = {
      productoId: input.productoId,
      cantidad: input.cantidad
    };

    if (input.varianteId) {
      payload.varianteId = input.varianteId;
    }

    if (authState && input.usuarioActual) {
      payload.clienteId = input.usuarioActual.id;
    } else {
      const guestCart = await this.loadGuestCart();
      payload.carritoId = guestCart.id;
    }

    await this.requestJson("/api/carritos/agregar-producto", {
      method: "POST",
      json: payload
    });

    return await this.ensureCartForCurrentMode(input.usuarioActual);
  }

  public async updateCartItemQuantity(input: {
    usuarioActual: Cliente | null;
    itemId: string;
    cantidad: number;
  }): Promise<Carrito> {
    await this.requestJson(`/api/items-carrito/${encodeURIComponent(input.itemId)}`, {
      method: "PUT",
      json: {
        cantidad: input.cantidad
      }
    });

    return await this.ensureCartForCurrentMode(input.usuarioActual);
  }

  public async removeCartItem(input: {
    usuarioActual: Cliente | null;
    itemId: string;
  }): Promise<Carrito> {
    await this.requestJson(`/api/carritos/items/${encodeURIComponent(input.itemId)}`, {
      method: "DELETE"
    });

    return await this.ensureCartForCurrentMode(input.usuarioActual);
  }

  public async checkout(cliente: Cliente): Promise<Pedido> {
    const payload = await this.requestJson<ApiPedido>("/api/pedidos/generar-desde-carrito", {
      method: "POST",
      json: {
        clienteId: cliente.id
      }
    });

    return this.mapPedido(payload);
  }

  public async loadRecoveryInbox(email: string): Promise<RecoveryInboxItem[]> {
    const recoveries = await this.requestJson<ApiRecoveryRecord[]>(
      `/api/recuperaciones?email=${encodeURIComponent(email)}`
    );

    return recoveries
      .slice()
      .sort(
        (left, right) =>
          new Date(right.fecha_solicitud).getTime() -
          new Date(left.fecha_solicitud).getTime()
      )
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

  public async requestPasswordRecovery(
    payload: ApiRecoveryRequestPayload
  ): Promise<RecoveryInboxItem[]> {
    await this.requestJson("/api/recuperaciones/solicitar", {
      method: "POST",
      json: payload
    });

    return await this.loadRecoveryInbox(payload.email);
  }

  public async getRecoveryByToken(token: string): Promise<{
    email: string | null;
    expiresAt: Date | null;
    status: "valid" | "expired" | "used" | "missing";
  }> {
    const recovery = await this.requestJson<ApiRecoveryRecord>(
      `/api/recuperaciones/${encodeURIComponent(token)}`
    );

    const status =
      recovery.estado === "USADA"
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

  public async resetPassword(
    token: string,
    payload: ApiPasswordResetPayload
  ): Promise<void> {
    await this.requestJson(`/api/recuperaciones/${encodeURIComponent(token)}/restablecer`, {
      method: "POST",
      json: payload
    });
  }

  public async mergeGuestCartIntoClient(clientId: string): Promise<void> {
    const guestCartId = this.runtimeState.loadGuestCartId();

    if (!guestCartId) {
      return;
    }

    let guestCart: Carrito;

    try {
      guestCart = this.mapCarrito(
        await this.requestJson<ApiCarrito>(
          `/api/carritos/${encodeURIComponent(guestCartId)}/completo`
        )
      );
    } catch {
      this.runtimeState.saveGuestCartId(null);
      return;
    }

    const currentClientCart = await this.requestJson<ApiCarrito>(
      `/api/carritos/cliente/${encodeURIComponent(clientId)}`
    );
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
      } catch {
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

  private async loadCatalog(): Promise<void> {
    const [categorias, productos] = await Promise.all([
      this.requestJson<ApiCategoria[]>("/api/categorias"),
      this.requestJson<ApiProducto[]>("/api/productos")
    ]);

    this.productosById.clear();
    this.variantesById.clear();
    this.categoriasById.clear();

    const categoriaEntities = categorias.map((categoria) => {
      const productosDeCategoria = productos.filter((producto) =>
        this.resolveCategoriaId(producto.categoria) === categoria.id
      );

      const productosModel = productosDeCategoria.map((producto) =>
        this.mapProducto(producto)
      );

      const categoriaEntity = new Categoria(
        categoria.nombre,
        categoria.descripcion ?? "",
        productosModel,
        categoria.id
      );

      this.categoriasById.set(categoria.id, categoriaEntity);
      return categoriaEntity;
    });

    const catalogo = productos
      .map((producto) => {
        const productoModel = this.mapProducto(producto);
        const categoriaEntity =
          this.categoriasById.get(this.resolveCategoriaId(producto.categoria)) ?? null;

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
        } as CatalogoEntry;
      })
      .filter((entry): entry is CatalogoEntry => Boolean(entry));

    this.categorias = categoriaEntities;
    this.catalogo = catalogo as CatalogoEntry[];
  }

  private mapProducto(apiProducto: ApiProducto): Producto {
    const variantes = (apiProducto.variantes ?? []).map((variante) =>
      this.mapVariante(variante)
    );

    const producto = new Producto(
      apiProducto.nombre,
      apiProducto.descripcion ?? "",
      Number(apiProducto.precio),
      apiProducto.estado === "ACTIVO",
      Number(apiProducto.stock ?? 0),
      variantes,
      apiProducto.id,
      apiProducto.imagen_url ?? ""
    );

    this.productosById.set(producto.id, producto);
    return producto;
  }

  private mapVariante(apiVariante: ApiVariante): VarianteProducto {
    const variante = new VarianteProducto(
      apiVariante.nombre,
      apiVariante.valor,
      Number(apiVariante.stock ?? 0),
      apiVariante.id
    );

    this.variantesById.set(variante.id, variante);
    return variante;
  }

  private mapCarrito(apiCarrito: ApiCarrito): Carrito {
    const items = (apiCarrito.items ?? []).map((item) => {
      const producto = this.getOrBuildProducto(item.producto);
      const variante = item.variante ? this.getOrBuildVariante(item.variante) : undefined;

      return new ItemCarrito(
        producto,
        Number(item.cantidad),
        variante,
        Number(item.precio_unitario),
        item.id
      );
    });

    return new Carrito(
      apiCarrito.fecha_creacion ? new Date(apiCarrito.fecha_creacion) : new Date(),
      items,
      apiCarrito.id
    );
  }

  private mapPedido(apiPedido: ApiPedido): Pedido {
    const detalles = (apiPedido.detalles ?? []).map(
      (detalle) =>
        new DetallePedido(
          Number(detalle.cantidad),
          Number(detalle.precio_unitario),
          typeof detalle.producto === "string"
            ? this.getProductoById(detalle.producto)?.nombre ?? detalle.producto
            : detalle.producto.nombre,
          detalle.variante
            ? typeof detalle.variante === "string"
              ? this.getVarianteById(detalle.variante)?.valor ?? detalle.variante
              : `${detalle.variante.nombre}: ${detalle.variante.valor}`
            : undefined
        )
    );

    return new Pedido(new Date(apiPedido.fecha), Number(apiPedido.total), detalles, apiPedido.id);
  }

  private mapCliente(
    apiCliente: ApiCliente,
    apiUsuario?: ApiUsuario,
    sesion?: ApiSesion
  ): Cliente {
    const usuario = typeof apiCliente.usuario === "string"
      ? apiUsuario
      : apiCliente.usuario;

    if (!usuario) {
      throw new Error("No se pudo reconstruir el usuario autenticado.");
    }

    const pedidos = (apiCliente.pedidos ?? []).map((pedido) => this.mapPedido(pedido));
    const cliente = new Cliente(
      usuario.nombre,
      usuario.email,
      "",
      usuario.fecha_nacimiento
        ? new Date(usuario.fecha_nacimiento)
        : new Date(),
      usuario.estado === "ACTIVO",
      pedidos,
      apiCliente.id
    );

    if (sesion) {
      cliente.restaurarSesion(
        new Sesion(
          new Date(sesion.fecha_inicio),
          sesion.id,
          sesion.token,
          new Date(sesion.fecha_expiracion),
          sesion.estado === "ACTIVA"
        )
      );
    }

    return cliente;
  }

  private getOrBuildProducto(apiProducto: ApiProducto | string): Producto {
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

  private getOrBuildVariante(apiVariante: ApiVariante | string): VarianteProducto {
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

  private resolveCategoriaId(categoria: ApiCategoria | string): string {
    return typeof categoria === "string" ? categoria : categoria.id;
  }

  private async requestJson<T>(url: string, init: ApiResponseInit = {}): Promise<T> {
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
    let data: unknown = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const message =
        typeof data === "object" && data !== null
          ? (data as { error?: string; message?: string }).error ||
            (data as { error?: string; message?: string }).message ||
            `La peticion fallo con estado ${response.status}`
          : typeof data === "string" && data
            ? data
            : `La peticion fallo con estado ${response.status}`;
      throw new Error(message);
    }

    return data as T;
  }
}
