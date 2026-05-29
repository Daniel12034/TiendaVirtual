import { Carrito } from "./models/Carrito.js";
import { Categoria } from "./models/Categoria.js";
import { Cliente } from "./models/Cliente.js";
import { Pedido } from "./models/Pedido.js";
import { Producto } from "./models/Producto.js";
import { VarianteProducto } from "./models/VarianteProducto.js";
import { BackendApiService } from "./services/BackendApiService.js";
import { RuntimeStateService } from "./services/RuntimeStateService.js";
import {
  AppRoute,
  AuthMode,
  AuthPageState,
  CART_CHANGED_EVENT,
  CartChangedDetail,
  CatalogPageState,
  CategoryFilterOption,
  CatalogoEntry,
  LoginInput,
  NavbarState,
  PasswordRecoveryInput,
  PasswordResetInput,
  PasswordResetPageState,
  ProductPageState,
  RecoveryInboxItem,
  RegistroInput
} from "./presentation/types.js";
import {
  primeraVarianteDisponible,
  obtenerVariantes,
  productoTieneStock,
  resumenStockProducto
} from "./presentation/utils/productState.js";
import { AuthPageView } from "./presentation/views/AuthPageView.js";
import { CartDrawerView } from "./presentation/views/CartDrawerView.js";
import { CatalogPageView } from "./presentation/views/CatalogPageView.js";
import { NavbarView } from "./presentation/views/NavbarView.js";
import { NotificationView } from "./presentation/views/NotificationView.js";
import { PasswordResetPageView } from "./presentation/views/PasswordResetPageView.js";
import { ProductPageView } from "./presentation/views/ProductPageView.js";
import { SessionModalView } from "./presentation/views/SessionModalView.js";

export class AppOrchestrator {
  private catalogo: CatalogoEntry[] = [];
  private categorias: Categoria[] = [];
  private readonly runtimeState = new RuntimeStateService();
  private readonly backend = new BackendApiService(this.runtimeState);
  private readonly navbarView: NavbarView;
  private readonly catalogPageView: CatalogPageView;
  private readonly productPageView: ProductPageView;
  private readonly authPageView: AuthPageView;
  private readonly passwordResetPageView: PasswordResetPageView;
  private readonly cartDrawerView: CartDrawerView;
  private readonly notificationView: NotificationView;
  private readonly sessionModalView: SessionModalView;
  private readonly productosPorPagina = 10;

  private carrito: Carrito = new Carrito();
  private usuarioActual: Cliente | null = null;
  private route: AppRoute = { name: "catalogo" };
  private searchQuery = "";
  private selectedCategoryId: string | null = null;
  private currentPage = 1;
  private authMode: AuthMode = "login";
  private cartDrawerOpen = false;
  private navbarScrolled = false;
  private sessionModalOpen = false;
  private sessionMonitorId: number | null = null;
  private recoveryInbox: RecoveryInboxItem[] = [];
  private passwordResetPageState: PasswordResetPageState = {
    email: null,
    expiresAt: null,
    status: "missing"
  };
  private sessionExpiresAt: Date | null = null;
  private readonly selectedVariantByProductId = new Map<string, string | null>();

  constructor(private readonly documentRef: Document) {
    this.navbarView = new NavbarView(
      this.getRequiredElement("navbar-root"),
      this.documentRef
    );
    this.catalogPageView = new CatalogPageView(this.getRequiredElement("app-view"));
    this.productPageView = new ProductPageView(this.getRequiredElement("app-view"));
    this.authPageView = new AuthPageView(this.getRequiredElement("app-view"));
    this.passwordResetPageView = new PasswordResetPageView(
      this.getRequiredElement("app-view")
    );
    this.cartDrawerView = new CartDrawerView(
      this.getRequiredElement("cart-drawer-root")
    );
    this.notificationView = new NotificationView(
      this.getRequiredElement("notification-root")
    );
    this.sessionModalView = new SessionModalView(
      this.getRequiredElement("modal-root")
    );
  }

  public async initialize(): Promise<void> {
    await this.backend.bootstrap();
    this.catalogo = this.backend.getCatalogo();
    this.categorias = this.backend.getCategorias();
    this.bindEvents();
    this.ensureInitialRoute();
    this.route = this.resolveRoute();
    await this.restoreSessionState();
    await this.syncCartFromBackend();
    await this.preparePasswordResetState();
    this.startSessionMonitor();
    this.renderAll();
    this.handleScroll();
    this.syncNavbarPresentation();
  }

  private bindEvents(): void {
    this.documentRef.addEventListener("click", this.handleClick);
    this.documentRef.addEventListener("submit", this.handleSubmit);
    this.documentRef.addEventListener("input", this.handleInput);
    window.addEventListener("hashchange", this.handleRouteChange);
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleResize);
  }

  private readonly handleClick = async (event: MouseEvent): Promise<void> => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionElement = target.closest<HTMLElement>("[data-action]");

    if (!actionElement) {
      return;
    }

    if (!(await this.touchSessionFromInteraction())) {
      return;
    }

    const action = actionElement.dataset.action;

    try {
      switch (action) {
        case "go-catalog":
          this.navigateTo("catalogo");
          break;
        case "go-login":
          this.authMode = "login";
          this.navigateTo("login");
          break;
        case "go-recovery":
          this.authMode = "recover";
          this.navigateTo("login");
          break;
        case "filter-category":
          this.filterByCategory(actionElement.dataset.categoryId || null);
          break;
        case "view-product":
          if (actionElement.dataset.productId) {
            if (actionElement instanceof HTMLAnchorElement) {
              event.preventDefault();
            }
            this.navigateTo(`producto/${actionElement.dataset.productId}`);
          }
          break;
        case "change-page":
          this.changePage(Number(actionElement.dataset.page));
          break;
        case "select-variant":
          this.selectVariant(actionElement.dataset.variantId);
          break;
        case "switch-auth-mode":
          this.switchAuthMode(actionElement.dataset.mode);
          break;
        case "toggle-cart":
          this.cartDrawerOpen = !this.cartDrawerOpen;
          this.renderCartDrawer();
          break;
        case "close-cart":
          this.cartDrawerOpen = false;
          this.renderCartDrawer();
          break;
        case "remove-cart-item":
          await this.removeCartItem(
            actionElement.dataset.productId,
            actionElement.dataset.variantId || undefined
          );
          break;
        case "decrease-cart-item":
          await this.changeCartItemQuantity(
            actionElement.dataset.productId,
            actionElement.dataset.variantId || undefined,
            -1
          );
          break;
        case "increase-cart-item":
          await this.changeCartItemQuantity(
            actionElement.dataset.productId,
            actionElement.dataset.variantId || undefined,
            1
          );
          break;
        case "checkout":
          await this.checkout();
          break;
        case "logout":
          await this.logout();
          break;
        case "close-session-modal":
          this.sessionModalOpen = false;
          this.renderModal();
          break;
        case "session-login":
          this.sessionModalOpen = false;
          this.authMode = "login";
          this.renderModal();
          this.navigateTo("login");
          break;
        default:
          break;
      }
    } catch (error) {
      this.notifyError(error);
    }
  };

  private readonly handleSubmit = async (event: SubmitEvent): Promise<void> => {
    const target = event.target;

    if (!(target instanceof HTMLFormElement)) {
      return;
    }

    event.preventDefault();

    if (!(await this.touchSessionFromInteraction())) {
      return;
    }

    try {
      switch (target.dataset.form) {
        case "search":
          this.submitSearch(target);
          break;
        case "add-to-cart":
          await this.addToCart(target);
          break;
        case "login":
          await this.login(target);
          break;
        case "register":
          await this.register(target);
          break;
        case "request-password-reset":
          await this.requestPasswordReset(target);
          break;
        case "reset-password":
          await this.resetPassword(target);
          break;
        default:
          break;
      }
    } catch (error) {
      this.notifyError(error);
    }
  };

  private readonly handleInput = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.name !== "search") {
      return;
    }

    this.searchQuery = target.value.trim();
    this.currentPage = 1;

    if (this.route.name === "catalogo") {
      this.renderCurrentPage();
    }
  };

  private readonly handleRouteChange = async (): Promise<void> => {
    this.closeCartDrawer();
    this.route = this.resolveRoute();
    this.ensureRouteIsValid();
    await this.preparePasswordResetState();
    this.renderAll();
  };

  private readonly handleScroll = (): void => {
    const nextScrolled = window.scrollY > 18;

    if (nextScrolled === this.navbarScrolled) {
      return;
    }

    this.navbarScrolled = nextScrolled;
    this.syncNavbarPresentation();
  };

  private readonly handleResize = (): void => {
    this.syncNavbarPresentation();
  };

  private async restoreSessionState(): Promise<void> {
    const savedAuth = this.runtimeState.loadAuthState();

    if (!savedAuth) {
      this.usuarioActual = null;
      this.sessionExpiresAt = null;
      this.recoveryInbox = [];
      return;
    }

    try {
      const session = await this.backend.loadSession(savedAuth.sessionId);

      if (!session.esValida()) {
        this.runtimeState.saveAuthState(null);
        this.usuarioActual = null;
        this.sessionExpiresAt = null;
        this.recoveryInbox = [];
        return;
      }

      this.sessionExpiresAt = session.fechaExpiracion;
      this.usuarioActual = await this.backend.getCurrentAuthUser();

      if (this.usuarioActual) {
        this.recoveryInbox = await this.backend.loadRecoveryInbox(
          this.usuarioActual.email
        );
      }
    } catch {
      this.runtimeState.saveAuthState(null);
      this.usuarioActual = null;
      this.sessionExpiresAt = null;
      this.recoveryInbox = [];
    }
  }

  private async syncCartFromBackend(): Promise<void> {
    this.carrito = await this.backend.ensureCartForCurrentMode(this.usuarioActual);
    this.emitCartChanged();
  }

  private async preparePasswordResetState(): Promise<void> {
    if (this.route.name !== "reset" || !this.route.token) {
      this.passwordResetPageState = {
        email: null,
        expiresAt: null,
        status: "missing"
      };
      return;
    }

    try {
      this.passwordResetPageState = await this.backend.getRecoveryByToken(
        this.route.token
      );
    } catch {
      this.passwordResetPageState = {
        email: null,
        expiresAt: null,
        status: "missing"
      };
    }
  }

  private renderAll(): void {
    this.renderNavbar();
    this.renderCurrentPage();
    this.renderCartDrawer();
    this.renderModal();
    this.emitCartChanged();
  }

  private renderNavbar(): void {
    const navbarState: NavbarState = {
      searchQuery: this.searchQuery,
      cartCount: this.getCartItemCount(),
      currentRoute: this.route.name,
      usuarioActual: this.usuarioActual
    };

    this.navbarView.render(navbarState);
    this.syncNavbarPresentation();
  }

  private renderCurrentPage(): void {
    switch (this.route.name) {
      case "catalogo":
        this.renderCatalogPage();
        break;
      case "detalle":
        this.renderProductPage();
        break;
      case "login":
        this.renderAuthPage();
        break;
      case "reset":
        this.renderPasswordResetPage();
        break;
      default:
        this.renderCatalogPage();
        break;
    }
  }

  private renderCatalogPage(): void {
    const filteredEntries = this.getFilteredCatalog();
    const totalPages = Math.max(
      1,
      Math.ceil(filteredEntries.length / this.productosPorPagina)
    );

    this.currentPage = Math.min(this.currentPage, totalPages);

    const start = (this.currentPage - 1) * this.productosPorPagina;
    const entries = filteredEntries.slice(start, start + this.productosPorPagina);

    const state: CatalogPageState = {
      entries,
      currentPage: this.currentPage,
      totalPages,
      totalItems: filteredEntries.length,
      searchQuery: this.searchQuery,
      categories: this.getCategoryOptions(),
      selectedCategoryId: this.selectedCategoryId
    };

    this.catalogPageView.render(state);
  }

  private renderProductPage(): void {
    const entry = this.getCurrentProductEntry();

    if (!entry) {
      this.notificationView.show(
        "Ese producto ya no esta disponible en el catalogo.",
        "info"
      );
      this.navigateTo("catalogo");
      return;
    }

    const selectedVariantId = this.ensureSelectedVariant(entry.producto);
    const selectedVariant = selectedVariantId
      ? entry.producto.obtenerVariante(selectedVariantId)
      : undefined;
    const variantes = obtenerVariantes(entry.producto);
    const canAddToCart =
      variantes.length > 0
        ? Boolean(selectedVariant?.disponible())
        : entry.producto.estaDisponible();
    const buttonLabel = canAddToCart ? "Agregar al carrito" : "Agotado";
    const stockLabel =
      variantes.length > 0
        ? selectedVariant
          ? selectedVariant.disponible()
            ? `${selectedVariant.valor} disponible`
            : `${selectedVariant.valor} agotado`
          : "Selecciona una opcion"
        : productoTieneStock(entry.producto)
          ? resumenStockProducto(entry.producto)
          : "Agotado";
    const maxQuantity =
      variantes.length > 0
        ? Math.max(1, selectedVariant?.obtenerStock() ?? 1)
        : Math.max(1, entry.producto.obtenerStock());

    const state: ProductPageState = {
      entry,
      selectedVariantId,
      canAddToCart,
      buttonLabel,
      stockLabel,
      maxQuantity
    };

    this.productPageView.render(state);
  }

  private renderAuthPage(): void {
    const state: AuthPageState = {
      mode: this.authMode,
      usuarioActual: this.usuarioActual,
      historial: this.usuarioActual?.verHistorial() ?? [],
      recoveryInbox: this.recoveryInbox
    };

    this.authPageView.render(state);
  }

  private renderPasswordResetPage(): void {
    this.passwordResetPageView.render(this.passwordResetPageState);
  }

  private renderCartDrawer(): void {
    this.cartDrawerView.render({
      isOpen: this.cartDrawerOpen,
      carrito: this.carrito,
      usuarioActual: this.usuarioActual
    });
  }

  private renderModal(): void {
    this.sessionModalView.render({ isOpen: this.sessionModalOpen });
  }

  private syncNavbarPresentation(): void {
    this.navbarView.setScrolled(this.navbarScrolled);

    const navbar = this.documentRef.querySelector<HTMLElement>(".navbar");
    const offset = navbar?.offsetHeight ?? 0;

    this.documentRef.documentElement.style.setProperty(
      "--navbar-offset",
      `${offset}px`
    );
  }

  private closeCartDrawer(): void {
    if (!this.cartDrawerOpen) {
      return;
    }

    this.cartDrawerOpen = false;
    this.renderCartDrawer();
  }

  private submitSearch(form: HTMLFormElement): void {
    const data = new FormData(form);
    this.searchQuery = String(data.get("search") ?? "").trim();
    this.currentPage = 1;
    this.closeCartDrawer();

    if (this.route.name !== "catalogo") {
      this.navigateTo("catalogo");
      return;
    }

    this.renderAll();
  }

  private async addToCart(form: HTMLFormElement): Promise<void> {
    const entry = this.getCurrentProductEntry();

    if (!entry) {
      throw new Error("Selecciona un producto antes de continuar.");
    }

    const quantityField = form.elements.namedItem("cantidad");

    if (!(quantityField instanceof HTMLInputElement)) {
      throw new Error("No se pudo leer la cantidad solicitada.");
    }

    const cantidad = Number(quantityField.value);
    const variante = this.getSelectedVariant(entry.producto);
    const variantes = obtenerVariantes(entry.producto);

    if (variantes.length > 0 && !variante) {
      throw new Error("Selecciona una opcion disponible antes de agregar.");
    }

    this.carrito = await this.backend.addToCart({
      usuarioActual: this.usuarioActual,
      productoId: entry.producto.id,
      varianteId: variante?.id ?? null,
      cantidad
    });

    if (this.cartDrawerOpen) {
      this.renderCartDrawer();
    }

    this.renderProductPage();
    this.emitCartChanged();
    this.notificationView.show(
      "Producto agregado al carrito. Puedes revisarlo desde el boton del carrito.",
      "success"
    );
  }

  private async removeCartItem(productId?: string, variantId?: string): Promise<void> {
    if (!productId) {
      throw new Error("No se pudo identificar el producto a eliminar.");
    }

    const item = this.carrito.obtenerItem(productId, variantId || undefined);

    if (!item) {
      throw new Error("No se encontro el item del carrito.");
    }

    this.carrito = await this.backend.removeCartItem({
      usuarioActual: this.usuarioActual,
      itemId: item.id
    });

    this.renderCartDrawer();
    this.emitCartChanged();
    this.notificationView.show("Producto eliminado del carrito.", "info");
  }

  private async changeCartItemQuantity(
    productId?: string,
    variantId?: string,
    delta: number = 0
  ): Promise<void> {
    if (!productId || !Number.isInteger(delta) || delta === 0) {
      return;
    }

    const item = this.carrito.obtenerItem(productId, variantId || undefined);

    if (!item) {
      throw new Error("No se encontro el item del carrito.");
    }

    const nuevaCantidad = item.cantidad + delta;

    if (nuevaCantidad <= 0) {
      await this.removeCartItem(productId, variantId);
      return;
    }

    this.carrito = await this.backend.updateCartItemQuantity({
      usuarioActual: this.usuarioActual,
      itemId: item.id,
      cantidad: nuevaCantidad
    });

    this.renderCartDrawer();
    this.emitCartChanged();
  }

  private async checkout(): Promise<void> {
    if (this.carrito.obtenerItems().length === 0) {
      this.notificationView.show("Tu carrito aun esta vacio.", "info");
      return;
    }

    if (!this.usuarioActual) {
      this.authMode = "login";
      this.cartDrawerOpen = false;
      this.renderCartDrawer();
      this.notificationView.show(
        "Inicia sesion para finalizar tu compra.",
        "info"
      );
      this.navigateTo("login");
      return;
    }

    const pedido = await this.backend.checkout(this.usuarioActual);
    this.usuarioActual.registrarPedido(pedido);
    this.carrito = await this.backend.ensureCartForCurrentMode(this.usuarioActual);
    this.cartDrawerOpen = false;
    this.renderAll();
    this.notificationView.show("Compra realizada con exito.", "success");
  }

  private async login(form: HTMLFormElement): Promise<void> {
    const data = new FormData(form);
    const credentials: LoginInput = {
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      password: String(data.get("password") ?? "")
    };

    this.validateLoginInput(credentials);

    this.usuarioActual = await this.backend.login(
      credentials.email,
      credentials.password
    );

    this.sessionExpiresAt = this.usuarioActual.obtenerSesionActiva()?.fechaExpiracion ?? null;
    await this.backend.mergeGuestCartIntoClient(this.usuarioActual.id);
    await this.syncCartFromBackend();
    this.recoveryInbox = await this.backend.loadRecoveryInbox(this.usuarioActual.email);
    this.sessionModalOpen = false;
    this.persistAuthPresentation();
    form.reset();
    this.notificationView.show(`Hola de nuevo, ${this.usuarioActual.nombre}.`, "success");
    this.navigateTo("catalogo");
  }

  private async register(form: HTMLFormElement): Promise<void> {
    const data = new FormData(form);
    const payload: RegistroInput = {
      nombre: String(data.get("nombre") ?? "").trim(),
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      password: String(data.get("password") ?? ""),
      fechaNacimiento: String(data.get("fechaNacimiento") ?? "")
    };

    this.validateRegisterInput(payload);

    this.usuarioActual = await this.backend.register({
      nombre: payload.nombre,
      email: payload.email,
      password: payload.password,
      fechaNacimiento: payload.fechaNacimiento
    });

    this.sessionExpiresAt = this.usuarioActual.obtenerSesionActiva()?.fechaExpiracion ?? null;
    await this.backend.mergeGuestCartIntoClient(this.usuarioActual.id);
    await this.syncCartFromBackend();
    this.recoveryInbox = await this.backend.loadRecoveryInbox(this.usuarioActual.email);
    this.sessionModalOpen = false;
    this.persistAuthPresentation();
    form.reset();
    this.notificationView.show("Tu cuenta fue creada correctamente.", "success");
    this.navigateTo("catalogo");
  }

  private async requestPasswordReset(form: HTMLFormElement): Promise<void> {
    const data = new FormData(form);
    const payload: PasswordRecoveryInput = {
      email: String(data.get("email") ?? "").trim().toLowerCase()
    };

    this.validatePasswordRecoveryInput(payload);
    this.recoveryInbox = await this.backend.requestPasswordRecovery(payload);
    form.reset();
    this.authMode = "recover";
    this.renderCurrentPage();
    this.notificationView.show(
      "Si el correo existe, enviamos un enlace de recuperacion. Ahora esa bandeja ya viene desde la base de datos.",
      "info"
    );
  }

  private async resetPassword(form: HTMLFormElement): Promise<void> {
    const request = this.getRouteRecoveryRequest();

    if (!request || this.passwordResetPageState.status !== "valid") {
      throw new Error("El enlace de recuperacion ya no es valido.");
    }

    const data = new FormData(form);
    const payload: PasswordResetInput = {
      password: String(data.get("password") ?? ""),
      confirmPassword: String(data.get("confirmPassword") ?? "")
    };

    this.validatePasswordResetInput(payload);
    await this.backend.resetPassword(request.token, payload);
    form.reset();
    this.authMode = "login";
    await this.preparePasswordResetState();
    this.notificationView.show(
      "Tu contrasena fue actualizada. Ya puedes iniciar sesion.",
      "success"
    );
    this.navigateTo("login");
  }

  private async logout(): Promise<void> {
    if (!this.usuarioActual) {
      return;
    }

    await this.backend.logout().catch(() => undefined);
    this.runtimeState.saveAuthState(null);
    this.usuarioActual = null;
    this.sessionExpiresAt = null;
    this.sessionModalOpen = false;
    this.recoveryInbox = [];
    await this.syncCartFromBackend();
    this.renderAll();
    this.notificationView.show("Sesion cerrada.", "info");
  }

  private filterByCategory(categoryId: string | null): void {
    this.selectedCategoryId = categoryId || null;
    this.currentPage = 1;
    this.closeCartDrawer();

    if (this.route.name !== "catalogo") {
      this.navigateTo("catalogo");
      return;
    }

    this.renderCurrentPage();
  }

  private changePage(page: number): void {
    if (Number.isNaN(page) || page < 1) {
      return;
    }

    const filteredEntries = this.getFilteredCatalog();
    const totalPages = Math.max(
      1,
      Math.ceil(filteredEntries.length / this.productosPorPagina)
    );

    this.currentPage = Math.min(page, totalPages);
    this.closeCartDrawer();
    this.renderCurrentPage();
  }

  private selectVariant(variantId?: string): void {
    const entry = this.getCurrentProductEntry();

    if (!entry || !variantId) {
      return;
    }

    this.selectedVariantByProductId.set(entry.producto.id, variantId);
    this.renderProductPage();
  }

  private switchAuthMode(mode?: string): void {
    if (mode !== "login" && mode !== "register" && mode !== "recover") {
      return;
    }

    this.authMode = mode;

    if (this.route.name === "login") {
      this.renderCurrentPage();
    }
  }

  private ensureInitialRoute(): void {
    if (!window.location.hash) {
      window.location.hash = "#/catalogo";
    }
  }

  private resolveRoute(): AppRoute {
    const hash = window.location.hash.replace(/^#\/?/, "");

    if (!hash || hash === "catalogo") {
      return { name: "catalogo" };
    }

    if (hash === "login") {
      return { name: "login" };
    }

    if (hash.startsWith("reset/")) {
      const [, token] = hash.split("/");
      return {
        name: "reset",
        token
      };
    }

    if (hash.startsWith("producto/")) {
      const [, productId] = hash.split("/");
      return {
        name: "detalle",
        productId
      };
    }

    return { name: "catalogo" };
  }

  private navigateTo(path: string): void {
    const nextHash = `#/${path}`;
    this.closeCartDrawer();

    if (window.location.hash === nextHash) {
      void this.handleRouteChange();
      return;
    }

    window.location.hash = nextHash;
  }

  private ensureRouteIsValid(): void {
    if (this.route.name === "detalle" && this.route.productId) {
      const exists = this.catalogo.some(
        (entry) => entry.producto.id === this.route.productId
      );

      if (!exists) {
        this.route = { name: "catalogo" };
        window.location.hash = "#/catalogo";
      }
    }
  }

  private getFilteredCatalog(): CatalogoEntry[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.catalogo.filter((entry) => {
      const matchesCategory = this.selectedCategoryId
        ? entry.categoria.id === this.selectedCategoryId
        : true;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchable = [
        entry.producto.nombre,
        entry.producto.descripcion,
        entry.categoria.nombre,
        entry.etiqueta
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }

  private getCurrentProductEntry(): CatalogoEntry | null {
    if (this.route.name !== "detalle" || !this.route.productId) {
      return null;
    }

    return (
      this.catalogo.find((entry) => entry.producto.id === this.route.productId) ??
      null
    );
  }

  private ensureSelectedVariant(producto: Producto): string | null {
    const variantes = obtenerVariantes(producto);

    if (variantes.length === 0) {
      this.selectedVariantByProductId.set(producto.id, null);
      return null;
    }

    const savedVariantId = this.selectedVariantByProductId.get(producto.id);
    const stillExists = savedVariantId
      ? producto.obtenerVariante(savedVariantId)
      : null;

    if (stillExists) {
      return savedVariantId ?? null;
    }

    const fallback = primeraVarianteDisponible(producto)?.id ?? variantes[0].id;
    this.selectedVariantByProductId.set(producto.id, fallback);
    return fallback;
  }

  private getSelectedVariant(producto: Producto): VarianteProducto | undefined {
    const selectedVariantId = this.ensureSelectedVariant(producto);

    if (!selectedVariantId) {
      return undefined;
    }

    return producto.obtenerVariante(selectedVariantId);
  }

  private validateLoginInput(credentials: LoginInput): void {
    if (!credentials.email || !credentials.password) {
      throw new Error("Completa email y contrasena.");
    }

    if (!this.isValidEmail(credentials.email)) {
      throw new Error("Ingresa un email valido.");
    }

    if (credentials.password.trim().length < 8) {
      throw new Error("Credenciales invalidas.");
    }
  }

  private validateRegisterInput(payload: RegistroInput): void {
    if (payload.nombre.length < 2) {
      throw new Error("Escribe un nombre valido.");
    }

    if (!this.isValidEmail(payload.email)) {
      throw new Error("Ingresa un email valido.");
    }

    if (payload.password.length < 8) {
      throw new Error("La contrasena debe tener al menos 8 caracteres.");
    }

    if (!payload.fechaNacimiento) {
      throw new Error("Selecciona tu fecha de nacimiento.");
    }
  }

  private validatePasswordRecoveryInput(payload: PasswordRecoveryInput): void {
    if (!payload.email) {
      throw new Error("Escribe tu email para recuperar la cuenta.");
    }

    if (!this.isValidEmail(payload.email)) {
      throw new Error("Ingresa un email valido.");
    }
  }

  private validatePasswordResetInput(payload: PasswordResetInput): void {
    if (payload.password.length < 8) {
      throw new Error("La contrasena debe tener al menos 8 caracteres.");
    }

    if (payload.password !== payload.confirmPassword) {
      throw new Error("Las contrasenas no coinciden.");
    }
  }

  private async touchSessionFromInteraction(): Promise<boolean> {
    if (!this.usuarioActual || !this.sessionExpiresAt) {
      return true;
    }

    if (Date.now() > this.sessionExpiresAt.getTime()) {
      await this.expireSessionState();
      return false;
    }

    return true;
  }

  private async expireSessionState(): Promise<void> {
    if (!this.usuarioActual) {
      return;
    }

    await this.backend.logout().catch(() => undefined);
    this.runtimeState.saveAuthState(null);
    this.usuarioActual = null;
    this.sessionExpiresAt = null;
    this.cartDrawerOpen = false;
    this.sessionModalOpen = true;
    this.recoveryInbox = [];
    await this.syncCartFromBackend();
    this.renderAll();
  }

  private startSessionMonitor(): void {
    if (this.sessionMonitorId !== null) {
      window.clearInterval(this.sessionMonitorId);
    }

    this.sessionMonitorId = window.setInterval(() => {
      if (!this.usuarioActual || !this.sessionExpiresAt) {
        return;
      }

      if (Date.now() > this.sessionExpiresAt.getTime()) {
        void this.expireSessionState();
      }
    }, 20_000);
  }

  private persistAuthPresentation(): void {
    this.sessionModalOpen = false;
    this.renderNavbar();
  }

  private emitCartChanged(): void {
    const detail: CartChangedDetail = {
      total: this.carrito.calcularTotal(),
      totalItems: this.getCartItemCount()
    };

    this.documentRef.dispatchEvent(
      new CustomEvent<CartChangedDetail>(CART_CHANGED_EVENT, { detail })
    );
  }

  private getCartItemCount(): number {
    return this.carrito
      .obtenerItems()
      .reduce((accumulator, item) => accumulator + item.cantidad, 0);
  }

  private getCategoryOptions(): CategoryFilterOption[] {
    return this.categorias.map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
      cantidadProductos: categoria.obtenerProductos().length
    }));
  }

  private getRouteRecoveryRequest():
    | { token: string; email: string | null; expiresAt: Date | null; status: string }
    | null {
    if (this.route.name !== "reset" || !this.route.token) {
      return null;
    }

    return {
      token: this.route.token,
      email: this.passwordResetPageState.email,
      expiresAt: this.passwordResetPageState.expiresAt,
      status: this.passwordResetPageState.status
    };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private getRequiredElement(id: string): HTMLElement {
    const element = this.documentRef.getElementById(id);

    if (!element) {
      throw new Error(`No se encontro el elemento #${id} en el DOM.`);
    }

    return element;
  }

  private notifyError(error: unknown): void {
    const message =
      error instanceof Error
        ? error.message
        : "Ocurrio un error inesperado.";
    this.notificationView.show(message, "error");
  }
}
