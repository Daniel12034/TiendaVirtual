import { CatalogoViewState } from "../types.js";
import { formatCurrency, escapeHtml } from "../utils/formatters.js";
import { productoTieneStock, resumenStockProducto } from "../utils/productState.js";

export class CatalogoView {
  constructor(private readonly root: HTMLElement) {}

  public render(state: CatalogoViewState): void {
    const items = state.entries
      .map((entry) => {
        const disponible = productoTieneStock(entry.producto);
        const selectedClass =
          state.selectedProductId === entry.producto.id
            ? " product-card--selected"
            : "";

        return `
          <article class="product-card${selectedClass}" aria-label="${escapeHtml(entry.producto.nombre)}">
            <div class="product-card__media">
              <img
                class="product-card__image"
                src="${entry.imagenUrl}"
                alt="${escapeHtml(entry.imagenAlt)}"
                width="440"
                height="320"
                loading="lazy"
              />
              <span class="product-card__badge">${escapeHtml(entry.etiqueta)}</span>
            </div>

            <div class="product-card__body">
              <p class="product-card__eyebrow">${escapeHtml(entry.categoria.nombre)}</p>
              <h3 class="product-card__name">${escapeHtml(entry.producto.nombre)}</h3>
              <span class="product-card__price">${formatCurrency(entry.producto.precio)}</span>
              <span class="product-card__stock">${escapeHtml(resumenStockProducto(entry.producto))}</span>
              <button
                type="button"
                class="button ${disponible ? "button--primary" : "button--ghost"}"
                data-action="select-product"
                data-product-id="${entry.producto.id}"
              >
                ${disponible ? "Ver detalle" : "Revisar stock"}
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    const pages = Array.from({ length: state.totalPages }, (_, index) => index + 1)
      .map(
        (page) => `
          <button
            type="button"
            class="button ${page === state.currentPage ? "button--secondary" : "button--ghost"}"
            data-action="change-page"
            data-page="${page}"
            aria-current="${page === state.currentPage ? "page" : "false"}"
          >
            ${page}
          </button>
        `
      )
      .join("");

    const start = state.entries.length === 0 ? 0 : (state.currentPage - 1) * 10 + 1;
    const end = (state.currentPage - 1) * 10 + state.entries.length;

    this.root.innerHTML = `
      <div class="catalog">
        <div class="catalog__summary">
          <span>Mostrando ${start}-${end} de ${state.totalItems} productos</span>
          <span class="catalog__chip">Carga optimizada por pagina</span>
        </div>

        <div class="catalog__grid">
          ${items}
        </div>

        <nav class="catalog__pagination" aria-label="Paginacion del catalogo">
          <button
            type="button"
            class="button button--ghost"
            data-action="change-page"
            data-page="${Math.max(1, state.currentPage - 1)}"
            ${state.currentPage === 1 ? "disabled" : ""}
          >
            Anterior
          </button>

          <div class="catalog__page-list">
            ${pages}
          </div>

          <button
            type="button"
            class="button button--ghost"
            data-action="change-page"
            data-page="${Math.min(state.totalPages, state.currentPage + 1)}"
            ${state.currentPage === state.totalPages ? "disabled" : ""}
          >
            Siguiente
          </button>
        </nav>
      </div>
    `;
  }
}
