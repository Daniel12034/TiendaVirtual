import {
  CART_CHANGED_EVENT,
  CartChangedDetail,
  NavbarState
} from "../types.js";
import { escapeHtml } from "../utils/formatters.js";

export class NavbarView {
  private isScrolled = false;

  constructor(
    private readonly root: HTMLElement,
    private readonly documentRef: Document
  ) {
    this.documentRef.addEventListener(
      CART_CHANGED_EVENT,
      this.handleCartChanged as EventListener
    );
  }

  public render(state: NavbarState): void {
    const accountLabel = state.usuarioActual ? state.usuarioActual.nombre : "Ingresar";
    const accountAction = state.usuarioActual ? "go-login" : "go-login";

    this.root.innerHTML = `
      <header class="navbar${this.isScrolled ? " navbar--scrolled" : ""}" aria-label="Navegacion principal">
        <div class="navbar__inner">
          <button
            type="button"
            class="navbar__logo"
            data-action="go-catalog"
            aria-label="Ir al inicio"
          >
            <span class="navbar__logo-mark">TV</span>
            <span class="navbar__logo-text">Tienda Virtual</span>
          </button>

          <form class="navbar__search" data-form="search" role="search">
            <label class="navbar__search-icon" for="navbar-search"></label>
            <input
              id="navbar-search"
              name="search"
              type="search"
              placeholder="Busca productos, categorias y novedades"
              value="${escapeHtml(state.searchQuery)}"
              autocomplete="off"
            />
            <button type="submit" class="navbar__search-button"></button>
          </form>

          <div class="navbar__actions">
            <button
              type="button"
              class="navbar__link ${state.currentRoute === "catalogo" ? "navbar__link--active" : ""}"
              data-action="go-catalog"
            >
              Inicio
            </button>

            <button
              type="button"
              class="navbar__account"
              data-action="${accountAction}"
              aria-label="Cuenta"
            >
              <span class="navbar__account-icon" aria-hidden="true">ACC</span>
              <span class="navbar__account-label">${escapeHtml(accountLabel)}</span>
            </button>

            <button
              type="button"
              class="navbar__cart"
              data-action="toggle-cart"
              aria-label="Abrir carrito"
            >
              <span class="navbar__cart-icon" aria-hidden="true">CART</span>
              <span class="navbar__cart-label">Carrito</span>
              <span class="navbar__badge" data-role="cart-badge">${state.cartCount}</span>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  public setScrolled(isScrolled: boolean): void {
    this.isScrolled = isScrolled;

    const navbar = this.root.querySelector<HTMLElement>(".navbar");

    if (!navbar) {
      return;
    }

    navbar.classList.toggle("navbar--scrolled", isScrolled);
  }

  private readonly handleCartChanged = (
    event: CustomEvent<CartChangedDetail>
  ): void => {
    const badge = this.root.querySelector<HTMLElement>("[data-role='cart-badge']");

    if (!badge) {
      return;
    }

    badge.textContent = String(event.detail.totalItems);
  };
}
