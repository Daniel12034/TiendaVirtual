import { ProductPageState } from "../types.js";
import { formatCurrency, escapeHtml } from "../utils/formatters.js";
import { obtenerVariantes } from "../utils/productState.js";

export class ProductPageView {
  constructor(private readonly root: HTMLElement) {}

  public render(state: ProductPageState): void {
    const { entry } = state;
    const variantes = obtenerVariantes(entry.producto);
    const opcionesMarkup = variantes
      .map((variante) => {
        const isSelected = variante.id === state.selectedVariantId;
        const disponible = variante.disponible();

        return `
          <button
            type="button"
            class="variant-option${isSelected ? " variant-option--selected" : ""}${disponible ? "" : " variant-option--disabled"}"
            data-action="select-variant"
            data-variant-id="${variante.id}"
            ${disponible ? "" : "disabled"}
            aria-pressed="${isSelected}"
          >
            <span>${escapeHtml(variante.valor)}</span>
            <small>${disponible ? `${variante.obtenerStock()} disponibles` : "Agotado"}</small>
          </button>
        `;
      })
      .join("");
    const photoSummary = entry.imagenMeta.verifiedHd
      ? `Foto real verificada en HD · ${entry.imagenMeta.width}x${entry.imagenMeta.height}`
      : `Foto real verificada · ${entry.imagenMeta.width}x${entry.imagenMeta.height}`;

    this.root.innerHTML = `
      <section class="product-page">
        <div class="product-page__breadcrumbs">
          <button type="button" class="link-button" data-action="go-catalog">Inicio</button>
          <span>/</span>
          <span>${escapeHtml(entry.categoria.nombre)}</span>
        </div>

        <div class="product-page__layout">
          <div class="product-page__gallery">
            <div class="product-page__image-frame">
              <img
                src="${entry.imagenUrl}"
                alt="${escapeHtml(entry.imagenAlt)}"
                width="${entry.imagenMeta.width}"
                height="${entry.imagenMeta.height}"
              />
            </div>
           
          </div>

          <div class="product-page__summary">
            <span class="eyebrow">${escapeHtml(entry.categoria.nombre)}</span>
            <h1>${escapeHtml(entry.producto.nombre)}</h1>
            <p class="product-page__description">${escapeHtml(entry.producto.descripcion)}</p>
            <strong class="product-page__price">${formatCurrency(entry.producto.precio)}</strong>
            <span class="stock-indicator ${state.canAddToCart ? "stock-indicator--ok" : "stock-indicator--empty"}">
              ${escapeHtml(state.stockLabel)}
            </span>

            ${
              variantes.length > 0
                ? `
                  <fieldset class="variant-selector">
                    <legend>${escapeHtml(variantes[0].nombre)}</legend>
                    <div class="variant-selector__list">
                      ${opcionesMarkup}
                    </div>
                  </fieldset>
                `
                : ""
            }

            <form class="purchase-box" data-form="add-to-cart">
              <div class="field">
                <label for="product-quantity">Cantidad</label>
                <input
                  id="product-quantity"
                  name="cantidad"
                  type="number"
                  min="1"
                  max="${state.maxQuantity}"
                  value="1"
                />
              </div>

              <button
                type="submit"
                class="button button--primary button--wide"
                ${state.canAddToCart ? "" : "disabled"}
              >
                ${escapeHtml(state.buttonLabel)}
              </button>
            </form>
          </div>
        </div>
      </section>
    `;
  }
}
