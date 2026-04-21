import { formatCurrency, escapeHtml } from "../utils/formatters.js";
export class CarritoView {
    constructor(root) {
        this.root = root;
    }
    render(state) {
        const items = state.carrito.obtenerItems();
        if (items.length === 0) {
            this.root.innerHTML = `
        <div class="cart">
          <div class="cart__empty">
            <h3 class="cart__title">Tu carrito esta vacio</h3>
            <p class="cart__meta">
              Agrega productos desde el detalle para ver subtotales y total en tiempo real.
            </p>
          </div>
        </div>
      `;
            return;
        }
        const itemsMarkup = items
            .map((item) => `
          <article class="cart__item">
            <div class="cart__item-head">
              <div>
                <div class="cart__item-name">${escapeHtml(item.producto.nombre)}</div>
                ${item.variante
            ? `<div class="cart__item-variant">${escapeHtml(item.variante.nombre)}: ${escapeHtml(item.variante.valor)}</div>`
            : ""}
              </div>
              <button
                type="button"
                class="button button--danger"
                data-action="remove-cart-item"
                data-product-id="${item.producto.id}"
                data-variant-id="${item.variante?.id ?? ""}"
              >
                Quitar
              </button>
            </div>

            <div class="cart__item-foot">
              <span class="cart__meta">${item.cantidad} x ${formatCurrency(item.precioUnitario)}</span>
              <strong>${formatCurrency(item.calcularSubtotal())}</strong>
            </div>
          </article>
        `)
            .join("");
        this.root.innerHTML = `
      <div class="cart">
        <div class="cart__list">
          ${itemsMarkup}
        </div>

        <section class="cart__summary" aria-label="Resumen del carrito">
          <div class="cart__summary-row">
            <span>Total actual</span>
            <strong>${formatCurrency(state.carrito.calcularTotal())}</strong>
          </div>

          <p class="cart__meta">
            ${state.usuarioActual
            ? `Compra lista para ${escapeHtml(state.usuarioActual.nombre)}.`
            : "Inicia sesion antes de confirmar el pago."}
          </p>

          <div class="cart__cta">
            <button
              type="button"
              class="button button--primary"
              data-action="checkout"
              ${state.usuarioActual ? "" : "disabled"}
            >
              Pagar
            </button>
          </div>
        </section>
      </div>
    `;
    }
}
