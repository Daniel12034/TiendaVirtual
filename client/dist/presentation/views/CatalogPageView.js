import { formatCurrency, escapeHtml } from "../utils/formatters.js";
import { resumenStockProducto } from "../utils/productState.js";
export class CatalogPageView {
    constructor(root) {
        this.root = root;
    }
    render(state) {
        const categoryMarkup = `
      <div class="category-filter" aria-label="Categorias disponibles">
        <button
          type="button"
          class="category-filter__chip ${state.selectedCategoryId ? "" : "category-filter__chip--active"}"
          data-action="filter-category"
          data-category-id=""
        >
          <span>Todas</span>
          <small>${state.categories.reduce((accumulator, category) => accumulator + category.cantidadProductos, 0)}</small>
        </button>

        ${state.categories
            .map((category) => `
              <button
                type="button"
                class="category-filter__chip ${category.id === state.selectedCategoryId ? "category-filter__chip--active" : ""}"
                data-action="filter-category"
                data-category-id="${category.id}"
              >
                <span>${escapeHtml(category.nombre)}</span>
                <small>${category.cantidadProductos}</small>
              </button>
            `)
            .join("")}
      </div>
    `;
        const productsMarkup = state.entries.length === 0
            ? `
          <article class="empty-state">
            <h2>No encontramos resultados</h2>
            <p>Prueba con otro termino o vuelve a explorar todo el catalogo.</p>
          </article>
        `
            : state.entries
                .map((entry) => {
                const photoBadge = entry.imagenMeta.verifiedHd
                    ? "Foto real HD"
                    : "Foto real";
                return `
                <a
                  class="product-card product-card--interactive"
                  href="#/producto/${entry.producto.id}"
                  data-action="view-product"
                  data-product-id="${entry.producto.id}"
                  aria-label="Ver detalle de ${escapeHtml(entry.producto.nombre)}"
                >
                  <div class="product-card__media">
                    <img
                      src="${entry.imagenUrl}"
                      alt="${escapeHtml(entry.imagenAlt)}"
                      loading="lazy"
                      width="${entry.imagenMeta.width}"
                      height="${entry.imagenMeta.height}"
                    />
                    <span class="product-card__tag">${escapeHtml(entry.etiqueta)}</span>
                  </div>

                  <div class="product-card__body">
                    <p class="product-card__category">${escapeHtml(entry.categoria.nombre)}</p>
                    <h3 class="product-card__title">${escapeHtml(entry.producto.nombre)}</h3>
                    <p class="product-card__description">${escapeHtml(entry.producto.descripcion)}</p>
                    <p class="product-card__photo-meta">
                      ${escapeHtml(photoBadge)} · ${entry.imagenMeta.width}x${entry.imagenMeta.height}
                    </p>
                    <div class="product-card__footer">
                      <div>
                        <strong class="product-card__price">${formatCurrency(entry.producto.precio)}</strong>
                        <span class="product-card__stock">${escapeHtml(resumenStockProducto(entry.producto))}</span>
                      </div>
                    </div>
                  </div>
                </a>
              `;
            })
                .join("");
        const paginationMarkup = state.totalPages > 1
            ? `
          <nav class="pagination" aria-label="Paginacion del catalogo">
            <button
              type="button"
              class="button button--ghost"
              data-action="change-page"
              data-page="${Math.max(1, state.currentPage - 1)}"
              ${state.currentPage === 1 ? "disabled" : ""}
            >
              Anterior
            </button>

            <div class="pagination__list">
              ${Array.from({ length: state.totalPages }, (_, index) => index + 1)
                .map((page) => `
                    <button
                      type="button"
                      class="pagination__page ${page === state.currentPage ? "pagination__page--active" : ""}"
                      data-action="change-page"
                      data-page="${page}"
                      aria-current="${page === state.currentPage ? "page" : "false"}"
                    >
                      ${page}
                    </button>
                  `)
                .join("")}
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
        `
            : "";
        this.root.innerHTML = `
      <section class="hero-banner">
        <div class="hero-banner__content">
          <span class="eyebrow hero-banner__eyebrow">Coleccion destacada</span>
          <h1>Encuentra productos pensados para tu día a día</h1>
          <p>
            Compra articulos seleccionados para casa, trabajo y viaje con una excelente experiencia de entrega.
          </p>
        </div>
        <div class="hero-banner__spotlight">
          <div class="hero-banner__spotlight-header">
            <span class="hero-banner__label">Envio rapido</span>
            <strong>Despachos claros, amistades duraderas!</strong>
            <p>
              Preparacion ágil y claro seguimiento.
            </p>
          </div>

          <div class="hero-banner__route" aria-hidden="true">
            <span class="hero-banner__route-stop"></span>
            <span class="hero-banner__route-line"></span>
            <span class="hero-banner__route-stop"></span>
            <span class="hero-banner__route-line"></span>
            <span class="hero-banner__route-stop"></span>
          </div>

          <div class="hero-banner__route-labels" aria-hidden="true">
            <span>Pedido</span>
            <span>Empaque</span>
            <span>Entrega</span>
          </div>
        </div>
      </section>

      <section class="catalog-page">
        <article class="section-panel">
          <div class="section-panel__header">
            <div>
              <span class="eyebrow">Categorias</span>
              <h2>Explora por categoria</h2>
            </div>
            <p class="section-header__meta">
              ${state.categories.length} categoria(s) disponibles
            </p>
          </div>
          ${categoryMarkup}
        </article>

        <div class="section-header">
          <div>
            <span class="eyebrow">${state.searchQuery ? "Resultados" : "Catalogo"}</span>
            <h2>${state.searchQuery ? `Coincidencias para "${escapeHtml(state.searchQuery)}"` : "Todo lo que te puede gustar"}</h2>
          </div>
          <p class="section-header__meta">${state.totalItems} producto(s)</p>
        </div>

        <div class="product-grid">
          ${productsMarkup}
        </div>

        ${paginationMarkup}
      </section>
    `;
    }
}
