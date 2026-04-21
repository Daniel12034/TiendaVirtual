import { Carrito } from "./models/Carrito.js";
import { Cliente } from "./models/Cliente.js";
import { Pedido } from "./models/Pedido.js";
import { crearCatalogoDemo } from "./data/catalogoSeed.js";
import { agregarMinutos, generarUUID } from "./utils/domainUtils.js";
import { FrontendDataService } from "./services/FrontendDataService.js";
import { StorageService } from "./services/StorageService.js";
import { CART_CHANGED_EVENT } from "./presentation/types.js";
import { primeraVarianteDisponible, obtenerVariantes, productoTieneStock, resumenStockProducto } from "./presentation/utils/productState.js";
import { AuthPageView } from "./presentation/views/AuthPageView.js";
import { CartDrawerView } from "./presentation/views/CartDrawerView.js";
import { CatalogPageView } from "./presentation/views/CatalogPageView.js";
import { NavbarView } from "./presentation/views/NavbarView.js";
import { NotificationView } from "./presentation/views/NotificationView.js";
import { PasswordResetPageView } from "./presentation/views/PasswordResetPageView.js";
import { ProductPageView } from "./presentation/views/ProductPageView.js";
import { SessionModalView } from "./presentation/views/SessionModalView.js";
export class AppOrchestrator {
    constructor(documentRef) {
        this.documentRef = documentRef;
        this.usuariosRegistrados = new Map();
        this.productosPorPagina = 10;
        this.usuarioActual = null;
        this.route = { name: "catalogo" };
        this.searchQuery = "";
        this.selectedCategoryId = null;
        this.currentPage = 1;
        this.authMode = "login";
        this.cartDrawerOpen = false;
        this.navbarScrolled = false;
        this.sessionModalOpen = false;
        this.sessionMonitorId = null;
        this.recoveryRequests = [];
        this.selectedVariantByProductId = new Map();
        this.handleClick = (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }
            const actionElement = target.closest("[data-action]");
            if (!actionElement) {
                return;
            }
            if (!this.touchSessionFromInteraction()) {
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
                        this.removeCartItem(actionElement.dataset.productId, actionElement.dataset.variantId || undefined);
                        break;
                    case "decrease-cart-item":
                        this.changeCartItemQuantity(actionElement.dataset.productId, actionElement.dataset.variantId || undefined, -1);
                        break;
                    case "increase-cart-item":
                        this.changeCartItemQuantity(actionElement.dataset.productId, actionElement.dataset.variantId || undefined, 1);
                        break;
                    case "checkout":
                        this.checkout();
                        break;
                    case "logout":
                        this.logout();
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
            }
            catch (error) {
                this.notifyError(error);
            }
        };
        this.handleSubmit = (event) => {
            const target = event.target;
            if (!(target instanceof HTMLFormElement)) {
                return;
            }
            event.preventDefault();
            if (!this.touchSessionFromInteraction()) {
                return;
            }
            try {
                switch (target.dataset.form) {
                    case "search":
                        this.submitSearch(target);
                        break;
                    case "add-to-cart":
                        this.addToCart(target);
                        break;
                    case "login":
                        this.login(target);
                        break;
                    case "register":
                        this.register(target);
                        break;
                    case "request-password-reset":
                        this.requestPasswordReset(target);
                        break;
                    case "reset-password":
                        this.resetPassword(target);
                        break;
                    default:
                        break;
                }
            }
            catch (error) {
                this.notifyError(error);
            }
        };
        this.handleInput = (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement)) {
                return;
            }
            if (target.name !== "search") {
                return;
            }
            if (!this.touchSessionFromInteraction()) {
                return;
            }
            this.searchQuery = target.value.trim();
            this.currentPage = 1;
            if (this.route.name === "catalogo") {
                this.renderCurrentPage();
            }
        };
        this.handleRouteChange = () => {
            this.closeCartDrawer();
            this.route = this.resolveRoute();
            this.ensureRouteIsValid();
            this.renderAll();
        };
        this.handleScroll = () => {
            const nextScrolled = window.scrollY > 18;
            if (nextScrolled === this.navbarScrolled) {
                return;
            }
            this.navbarScrolled = nextScrolled;
            this.syncNavbarPresentation();
        };
        this.handleResize = () => {
            this.syncNavbarPresentation();
        };
        const { catalogo, categorias } = crearCatalogoDemo();
        this.catalogo = catalogo;
        this.categorias = categorias;
        this.storageService = new StorageService();
        this.frontendDataService = new FrontendDataService();
        this.carrito =
            this.storageService.loadCart(this.catalogo.map((entry) => entry.producto)) ??
                new Carrito();
        this.navbarView = new NavbarView(this.getRequiredElement("navbar-root"), this.documentRef);
        this.catalogPageView = new CatalogPageView(this.getRequiredElement("app-view"));
        this.productPageView = new ProductPageView(this.getRequiredElement("app-view"));
        this.authPageView = new AuthPageView(this.getRequiredElement("app-view"));
        this.passwordResetPageView = new PasswordResetPageView(this.getRequiredElement("app-view"));
        this.cartDrawerView = new CartDrawerView(this.getRequiredElement("cart-drawer-root"));
        this.notificationView = new NotificationView(this.getRequiredElement("notification-root"));
        this.sessionModalView = new SessionModalView(this.getRequiredElement("modal-root"));
    }
    initialize() {
        this.loadPersistedUsers();
        this.ensureDemoUser();
        this.restoreCurrentUser();
        this.recoveryRequests = this.frontendDataService.loadRecoveryRequests();
        this.ensureInitialRoute();
        this.route = this.resolveRoute();
        this.bindEvents();
        this.startSessionMonitor();
        this.renderAll();
        this.handleScroll();
        this.syncNavbarPresentation();
    }
    bindEvents() {
        this.documentRef.addEventListener("click", this.handleClick);
        this.documentRef.addEventListener("submit", this.handleSubmit);
        this.documentRef.addEventListener("input", this.handleInput);
        window.addEventListener("hashchange", this.handleRouteChange);
        window.addEventListener("scroll", this.handleScroll, { passive: true });
        window.addEventListener("resize", this.handleResize);
    }
    renderAll() {
        this.renderNavbar();
        this.renderCurrentPage();
        this.renderCartDrawer();
        this.renderModal();
        this.emitCartChanged();
    }
    renderNavbar() {
        const navbarState = {
            searchQuery: this.searchQuery,
            cartCount: this.getCartItemCount(),
            currentRoute: this.route.name,
            usuarioActual: this.usuarioActual
        };
        this.navbarView.render(navbarState);
        this.syncNavbarPresentation();
    }
    renderCurrentPage() {
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
    renderCatalogPage() {
        const filteredEntries = this.getFilteredCatalog();
        const totalPages = Math.max(1, Math.ceil(filteredEntries.length / this.productosPorPagina));
        this.currentPage = Math.min(this.currentPage, totalPages);
        const start = (this.currentPage - 1) * this.productosPorPagina;
        const entries = filteredEntries.slice(start, start + this.productosPorPagina);
        const state = {
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
    renderProductPage() {
        const entry = this.getCurrentProductEntry();
        if (!entry) {
            this.notificationView.show("Ese producto ya no esta disponible en el catalogo.", "info");
            this.navigateTo("catalogo");
            return;
        }
        const selectedVariantId = this.ensureSelectedVariant(entry.producto);
        const selectedVariant = selectedVariantId
            ? entry.producto.obtenerVariante(selectedVariantId)
            : undefined;
        const variantes = obtenerVariantes(entry.producto);
        const canAddToCart = variantes.length > 0
            ? Boolean(selectedVariant?.disponible())
            : entry.producto.estaDisponible();
        const buttonLabel = canAddToCart ? "Agregar al carrito" : "Agotado";
        const stockLabel = variantes.length > 0
            ? selectedVariant
                ? selectedVariant.disponible()
                    ? `${selectedVariant.valor} disponible`
                    : `${selectedVariant.valor} agotado`
                : "Selecciona una opcion"
            : productoTieneStock(entry.producto)
                ? resumenStockProducto(entry.producto)
                : "Agotado";
        const maxQuantity = variantes.length > 0
            ? Math.max(1, selectedVariant?.obtenerStock() ?? 1)
            : Math.max(1, entry.producto.obtenerStock());
        const state = {
            entry,
            selectedVariantId,
            canAddToCart,
            buttonLabel,
            stockLabel,
            maxQuantity
        };
        this.productPageView.render(state);
    }
    renderAuthPage() {
        const state = {
            mode: this.authMode,
            usuarioActual: this.usuarioActual,
            historial: this.usuarioActual?.verHistorial() ?? [],
            recoveryInbox: this.getRecoveryInboxItems()
        };
        this.authPageView.render(state);
    }
    renderPasswordResetPage() {
        const state = this.getPasswordResetPageState();
        this.passwordResetPageView.render(state);
    }
    renderCartDrawer() {
        this.cartDrawerView.render({
            isOpen: this.cartDrawerOpen,
            carrito: this.carrito,
            usuarioActual: this.usuarioActual
        });
    }
    renderModal() {
        this.sessionModalView.render({ isOpen: this.sessionModalOpen });
    }
    syncNavbarPresentation() {
        this.navbarView.setScrolled(this.navbarScrolled);
        const navbar = this.documentRef.querySelector(".navbar");
        const offset = navbar?.offsetHeight ?? 0;
        this.documentRef.documentElement.style.setProperty("--navbar-offset", `${offset}px`);
    }
    closeCartDrawer() {
        if (!this.cartDrawerOpen) {
            return;
        }
        this.cartDrawerOpen = false;
        this.renderCartDrawer();
    }
    submitSearch(form) {
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
    addToCart(form) {
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
        this.carrito.agregarProducto(entry.producto, cantidad, variante);
        this.persistCart();
        if (this.cartDrawerOpen) {
            this.renderCartDrawer();
        }
        this.renderProductPage();
        this.notificationView.show("Producto agregado al carrito. Puedes revisarlo desde el boton del carrito.", "success");
    }
    removeCartItem(productId, variantId) {
        if (!productId) {
            throw new Error("No se pudo identificar el producto a eliminar.");
        }
        this.carrito.eliminarProducto(productId, variantId || undefined);
        this.persistCart();
        this.renderCartDrawer();
        this.notificationView.show("Producto eliminado del carrito.", "info");
    }
    changeCartItemQuantity(productId, variantId, delta = 0) {
        if (!productId || !Number.isInteger(delta) || delta === 0) {
            return;
        }
        const item = this.carrito.obtenerItem(productId, variantId || undefined);
        if (!item) {
            throw new Error("No se encontro el item del carrito.");
        }
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad <= 0) {
            this.removeCartItem(productId, variantId);
            return;
        }
        this.carrito.actualizarCantidad(productId, nuevaCantidad, variantId || undefined);
        this.persistCart();
        this.renderCartDrawer();
    }
    checkout() {
        if (this.carrito.obtenerItems().length === 0) {
            this.notificationView.show("Tu carrito aun esta vacio.", "info");
            return;
        }
        if (!this.usuarioActual) {
            this.authMode = "login";
            this.cartDrawerOpen = false;
            this.renderCartDrawer();
            this.notificationView.show("Inicia sesion para finalizar tu compra.", "info");
            this.navigateTo("login");
            return;
        }
        if (!this.ensureSessionIsAlive()) {
            return;
        }
        const pedido = new Pedido().generarOrden(this.carrito);
        this.usuarioActual.registrarPedido(pedido);
        this.cartDrawerOpen = false;
        this.storageService.clearCart();
        this.persistAuthState();
        this.renderAll();
        this.notificationView.show("Compra realizada con exito.", "success");
    }
    login(form) {
        const data = new FormData(form);
        const credentials = {
            email: String(data.get("email") ?? "").trim().toLowerCase(),
            password: String(data.get("password") ?? "")
        };
        this.validateLoginInput(credentials);
        const usuario = this.usuariosRegistrados.get(credentials.email);
        if (!usuario) {
            throw new Error("Credenciales invalidas.");
        }
        try {
            usuario.login(credentials.password);
        }
        catch {
            throw new Error("Credenciales invalidas.");
        }
        this.usuarioActual = usuario;
        this.sessionModalOpen = false;
        this.persistAuthState();
        this.renderNavbar();
        form.reset();
        this.notificationView.show(`Hola de nuevo, ${usuario.nombre}.`, "success");
        this.navigateTo("catalogo");
    }
    register(form) {
        const data = new FormData(form);
        const payload = {
            nombre: String(data.get("nombre") ?? "").trim(),
            email: String(data.get("email") ?? "").trim().toLowerCase(),
            password: String(data.get("password") ?? ""),
            fechaNacimiento: String(data.get("fechaNacimiento") ?? "")
        };
        this.validateRegisterInput(payload);
        if (this.usuariosRegistrados.has(payload.email)) {
            throw new Error("Ya existe una cuenta con ese email.");
        }
        const usuario = new Cliente(payload.nombre, payload.email, payload.password, new Date(`${payload.fechaNacimiento}T00:00:00`));
        usuario.registrar();
        usuario.login(payload.password);
        this.usuariosRegistrados.set(usuario.email.toLowerCase(), usuario);
        this.usuarioActual = usuario;
        this.sessionModalOpen = false;
        this.persistAuthState();
        form.reset();
        this.notificationView.show("Tu cuenta fue creada correctamente.", "success");
        this.navigateTo("catalogo");
    }
    requestPasswordReset(form) {
        const data = new FormData(form);
        const payload = {
            email: String(data.get("email") ?? "").trim().toLowerCase()
        };
        this.validatePasswordRecoveryInput(payload);
        const usuario = this.usuariosRegistrados.get(payload.email);
        if (usuario) {
            const now = new Date();
            this.recoveryRequests.unshift({
                id: generarUUID(),
                email: payload.email,
                token: generarUUID(),
                createdAt: now.toISOString(),
                expiresAt: agregarMinutos(now, 30).toISOString(),
                consumedAt: null
            });
            this.persistRecoveryRequests();
        }
        form.reset();
        this.authMode = "recover";
        this.renderCurrentPage();
        this.notificationView.show("Si el correo existe, enviamos un enlace de recuperacion. En esta version frontend lo dejaremos disponible en la bandeja local.", "info");
    }
    resetPassword(form) {
        const request = this.getRouteRecoveryRequest();
        if (!request || this.getRecoveryRequestStatus(request) !== "pending") {
            throw new Error("El enlace de recuperacion ya no es valido.");
        }
        const data = new FormData(form);
        const payload = {
            password: String(data.get("password") ?? ""),
            confirmPassword: String(data.get("confirmPassword") ?? "")
        };
        this.validatePasswordResetInput(payload);
        const usuario = this.usuariosRegistrados.get(request.email.toLowerCase());
        if (!usuario) {
            throw new Error("No encontramos una cuenta activa para ese enlace.");
        }
        usuario.cambiarContrasena(payload.password);
        request.consumedAt = new Date().toISOString();
        if (this.usuarioActual?.email.toLowerCase() === usuario.email.toLowerCase()) {
            this.usuarioActual = null;
        }
        this.persistAuthState();
        this.persistRecoveryRequests();
        form.reset();
        this.authMode = "login";
        this.notificationView.show("Tu contrasena fue actualizada. Ya puedes iniciar sesion.", "success");
        this.navigateTo("login");
    }
    logout() {
        if (!this.usuarioActual) {
            return;
        }
        this.usuarioActual.logout();
        this.usuarioActual = null;
        this.sessionModalOpen = false;
        this.persistAuthState();
        this.renderAll();
        this.notificationView.show("Sesion cerrada.", "info");
    }
    filterByCategory(categoryId) {
        this.selectedCategoryId = categoryId || null;
        this.currentPage = 1;
        this.closeCartDrawer();
        if (this.route.name !== "catalogo") {
            this.navigateTo("catalogo");
            return;
        }
        this.renderCurrentPage();
    }
    changePage(page) {
        if (Number.isNaN(page) || page < 1) {
            return;
        }
        const filteredEntries = this.getFilteredCatalog();
        const totalPages = Math.max(1, Math.ceil(filteredEntries.length / this.productosPorPagina));
        this.currentPage = Math.min(page, totalPages);
        this.closeCartDrawer();
        this.renderCurrentPage();
    }
    selectVariant(variantId) {
        const entry = this.getCurrentProductEntry();
        if (!entry || !variantId) {
            return;
        }
        this.selectedVariantByProductId.set(entry.producto.id, variantId);
        this.renderProductPage();
    }
    switchAuthMode(mode) {
        if (mode !== "login" && mode !== "register" && mode !== "recover") {
            return;
        }
        this.authMode = mode;
        if (this.route.name === "login") {
            this.renderCurrentPage();
        }
    }
    ensureInitialRoute() {
        if (!window.location.hash) {
            window.location.hash = "#/catalogo";
        }
    }
    resolveRoute() {
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
    navigateTo(path) {
        const nextHash = `#/${path}`;
        this.closeCartDrawer();
        if (window.location.hash === nextHash) {
            this.handleRouteChange();
            return;
        }
        window.location.hash = nextHash;
    }
    ensureRouteIsValid() {
        if (this.route.name === "detalle" && this.route.productId) {
            const exists = this.catalogo.some((entry) => entry.producto.id === this.route.productId);
            if (!exists) {
                this.route = { name: "catalogo" };
                window.location.hash = "#/catalogo";
            }
        }
    }
    getFilteredCatalog() {
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
    getCurrentProductEntry() {
        if (this.route.name !== "detalle" || !this.route.productId) {
            return null;
        }
        return (this.catalogo.find((entry) => entry.producto.id === this.route.productId) ??
            null);
    }
    ensureSelectedVariant(producto) {
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
    getSelectedVariant(producto) {
        const selectedVariantId = this.ensureSelectedVariant(producto);
        if (!selectedVariantId) {
            return undefined;
        }
        return producto.obtenerVariante(selectedVariantId);
    }
    validateLoginInput(credentials) {
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
    validateRegisterInput(payload) {
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
    validatePasswordRecoveryInput(payload) {
        if (!payload.email) {
            throw new Error("Escribe tu email para recuperar la cuenta.");
        }
        if (!this.isValidEmail(payload.email)) {
            throw new Error("Ingresa un email valido.");
        }
    }
    validatePasswordResetInput(payload) {
        if (payload.password.length < 8) {
            throw new Error("La contrasena debe tener al menos 8 caracteres.");
        }
        if (payload.password !== payload.confirmPassword) {
            throw new Error("Las contrasenas no coinciden.");
        }
    }
    touchSessionFromInteraction() {
        if (!this.usuarioActual) {
            return true;
        }
        const sesion = this.usuarioActual.obtenerSesionActiva();
        if (!sesion) {
            this.expireSessionState();
            return false;
        }
        this.usuarioActual.registrarActividad();
        this.persistAuthState();
        return true;
    }
    ensureSessionIsAlive() {
        if (!this.usuarioActual) {
            return false;
        }
        const sesion = this.usuarioActual.obtenerSesionActiva();
        if (!sesion) {
            this.expireSessionState();
            return false;
        }
        return true;
    }
    startSessionMonitor() {
        if (this.sessionMonitorId !== null) {
            window.clearInterval(this.sessionMonitorId);
        }
        this.sessionMonitorId = window.setInterval(() => {
            if (!this.usuarioActual) {
                return;
            }
            if (!this.usuarioActual.obtenerSesionActiva()) {
                this.expireSessionState();
            }
        }, 20_000);
    }
    expireSessionState() {
        if (!this.usuarioActual) {
            return;
        }
        this.usuarioActual.logout();
        this.usuarioActual = null;
        this.cartDrawerOpen = false;
        this.sessionModalOpen = true;
        this.persistAuthState();
        this.renderAll();
    }
    persistCart() {
        if (this.carrito.obtenerItems().length === 0) {
            this.storageService.clearCart();
        }
        else {
            this.storageService.saveCart(this.carrito);
        }
        this.emitCartChanged();
    }
    persistUsers() {
        this.frontendDataService.saveUsers(this.usuariosRegistrados.values());
    }
    persistAuthState() {
        this.persistUsers();
        this.frontendDataService.saveCurrentUserEmail(this.usuarioActual?.email.toLowerCase() ?? null);
    }
    persistRecoveryRequests() {
        this.frontendDataService.saveRecoveryRequests(this.recoveryRequests);
    }
    emitCartChanged() {
        const detail = {
            total: this.carrito.calcularTotal(),
            totalItems: this.getCartItemCount()
        };
        this.documentRef.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT, { detail }));
    }
    getCartItemCount() {
        return this.carrito
            .obtenerItems()
            .reduce((accumulator, item) => accumulator + item.cantidad, 0);
    }
    getCategoryOptions() {
        return this.categorias.map((categoria) => ({
            id: categoria.id,
            nombre: categoria.nombre,
            cantidadProductos: categoria.obtenerProductos().length
        }));
    }
    getRecoveryInboxItems() {
        return this.recoveryRequests
            .slice()
            .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
            .slice(0, 6)
            .map((request) => ({
            id: request.id,
            email: request.email,
            expiresAt: new Date(request.expiresAt),
            resetPath: `#/reset/${request.token}`,
            status: this.getRecoveryRequestStatus(request)
        }));
    }
    getPasswordResetPageState() {
        const request = this.getRouteRecoveryRequest();
        if (!request) {
            return {
                email: null,
                expiresAt: null,
                status: "missing"
            };
        }
        const requestStatus = this.getRecoveryRequestStatus(request);
        return {
            email: request.email,
            expiresAt: new Date(request.expiresAt),
            status: requestStatus === "pending" ? "valid" : requestStatus
        };
    }
    getRouteRecoveryRequest() {
        if (this.route.name !== "reset" || !this.route.token) {
            return null;
        }
        return (this.recoveryRequests.find((request) => request.token === this.route.token) ??
            null);
    }
    getRecoveryRequestStatus(request) {
        if (request.consumedAt) {
            return "used";
        }
        if (new Date().getTime() > new Date(request.expiresAt).getTime()) {
            return "expired";
        }
        return "pending";
    }
    loadPersistedUsers() {
        this.usuariosRegistrados.clear();
        for (const usuario of this.frontendDataService.loadUsers()) {
            this.usuariosRegistrados.set(usuario.email.toLowerCase(), usuario);
        }
    }
    restoreCurrentUser() {
        const savedEmail = this.frontendDataService
            .loadCurrentUserEmail()
            ?.trim()
            .toLowerCase();
        if (!savedEmail) {
            return;
        }
        const usuario = this.usuariosRegistrados.get(savedEmail);
        if (!usuario) {
            this.frontendDataService.saveCurrentUserEmail(null);
            return;
        }
        if (!usuario.obtenerSesionActiva()) {
            usuario.logout();
            this.frontendDataService.saveCurrentUserEmail(null);
            this.persistUsers();
            return;
        }
        this.usuarioActual = usuario;
    }
    ensureDemoUser() {
        if (this.usuariosRegistrados.has("demo@tiendaonline.com")) {
            return;
        }
        const demoUser = new Cliente("Camila Torres", "demo@tiendaonline.com", "compras123", new Date("1996-07-02T00:00:00"));
        demoUser.registrar();
        this.usuariosRegistrados.set(demoUser.email.toLowerCase(), demoUser);
        this.persistUsers();
    }
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    getRequiredElement(id) {
        const element = this.documentRef.getElementById(id);
        if (!element) {
            throw new Error(`No se encontro el elemento #${id} en el DOM.`);
        }
        return element;
    }
    notifyError(error) {
        const message = error instanceof Error
            ? error.message
            : "Ocurrio un error inesperado.";
        this.notificationView.show(message, "error");
    }
}
