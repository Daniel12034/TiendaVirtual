import { ProductoDetalleState } from "../types.js";
import { formatCurrency, escapeHtml } from "../utils/formatters.js";
import { obtenerVariantes } from "../utils/productState.js";

export class ProductoDetalleView {
  constructor(private readonly root: HTMLElement) {}

  public render(state: ProductoDetalleState): void {
    if (!state.entry) {
      this.root.innerHTML = `
        <div class="detail__empty">
          <h3 class="detail__title">Selecciona un producto</h3>
          <p class="detail__description">
            El detalle aparecera aqui con descripcion, variantes y acciones del carrito.
          </p>
        </div>
      `;
      return;
    }

    const { producto } = state.entry;
    const variantes = obtenerVariantes(producto);
    const grupoNombre = variantes[0]?.nombre ?? "Variante";
    const optionsMarkup =
      variantes.length === 0
        ? ""
        : variantes
            .map((variante) => {
              const available = variante.disponible();
              const selectedClass =
                variante.id === state.selectedVariantId
                  ? " variant-chip--selected"
                  : "";
              const disabledClass = available ? "" : " variant-chip--disabled";

              return `
                <button
                  type="button"
                  class="variant-chip${selectedClass}${disabledClass}"
                  data-action="select-variant"
                  data-variant-id="${variante.id}"
                  aria-pressed="${variante.id === state.selectedVariantId}"
                >
                  <span>${escapeHtml(variante.valor)}</span>
                  <small>${available ? `Stock ${variante.obtenerStock()}` : "Sin stock"}</small>
                </button>
              `;
            })
            .join("");

    this.root.innerHTML = `
      <div class="detail">
        <div class="detail__media">
          <img
            class="detail__image"
            src="${state.entry.imagenUrl}"
            alt="${escapeHtml(state.entry.imagenAlt)}"
            width="720"
            height="520"
          />
        </div>

        <div class="detail__header">
          <p class="detail__eyebrow">${escapeHtml(state.entry.categoria.nombre)}</p>
          <h3 class="detail__title">${escapeHtml(producto.nombre)}</h3>
          <p class="detail__description">${escapeHtml(producto.descripcion)}</p>
        </div>

        <div class="detail__price-row">
          <span class="detail__price">${formatCurrency(producto.precio)}</span>
          <span class="detail__stock-pill ${state.canAddToCart ? "detail__stock-pill--success" : "detail__stock-pill--warning"}">
            ${escapeHtml(state.stockMessage)}
          </span>
        </div>

        ${
          variantes.length > 0
            ? `
              <fieldset class="detail__group">
                <legend class="detail__legend">Selecciona ${escapeHtml(grupoNombre.toLowerCase())}</legend>
                <div class="detail__options">
                  ${optionsMarkup}
                </div>
              </fieldset>
            `
            : `
              <div class="detail__meta-row">
                <span class="status-pill ${state.canAddToCart ? "status-pill--success" : "status-pill--warning"}">
                  ${state.canAddToCart ? "Stock listo para agregar" : "Producto agotado"}
                </span>
                <span class="detail__stock-message">${escapeHtml(state.stockMessage)}</span>
              </div>
            `
        }

        <form class="detail__form" data-form="add-to-cart" novalidate>
          <div class="field">
            <label for="cantidad-producto">Cantidad</label>
            <input
              id="cantidad-producto"
              name="cantidad"
              type="number"
              min="1"
              max="${state.maxQuantity}"
              value="1"
              inputmode="numeric"
            />
          </div>

          <button
            type="submit"
            class="button button--primary"
            ${state.canAddToCart ? "" : "disabled"}
          >
            Agregar al carrito
          </button>
        </form>
      </div>
    `;
  }
}
