import { formatCurrency, escapeHtml } from "../utils/formatters.js";
export class CartDrawerView {
    constructor(root) {
        this.root = root;
    }
    render(state) {
        if (!state.isOpen) {
            this.root.innerHTML = "";
            return;
        }
        const items = state.carrito.obtenerItems();
        const itemsMarkup = items.length === 0
            ? `
          <article class="drawer-empty">
            <h2>Tu carrito esta vacio</h2>
            <p>Agrega productos para verlos aqui.</p>
          </article>
        `
            : items
                .map((item) => `
                <article class="drawer-item">
                  <div class="drawer-item__top">
                    <div>
                      <strong>${escapeHtml(item.producto.nombre)}</strong>
                      ${item.variante
                ? `<span>${escapeHtml(item.variante.nombre)}: ${escapeHtml(item.variante.valor)}</span>`
                : ""}
                    </div>
                    <button
                      type="button"
                      class="icon-button"
                      data-action="remove-cart-item"
                      data-product-id="${item.producto.id}"
                      data-variant-id="${item.variante?.id ?? ""}"
                      aria-label="Eliminar producto"
                    >
                      x
                    </button>
                  </div>
                  <div class="drawer-item__bottom">
                    <div class="drawer-item__quantity">
                      <button
                        type="button"
                        class="icon-button"
                        data-action="decrease-cart-item"
                        data-product-id="${item.producto.id}"
                        data-variant-id="${item.variante?.id ?? ""}"
                        aria-label="Disminuir cantidad"
                        ${item.cantidad <= 1 ? "disabled" : ""}
                      >
                        -
                      </button>
                      <strong>${item.cantidad}</strong>
                      <button
                        type="button"
                        class="icon-button"
                        data-action="increase-cart-item"
                        data-product-id="${item.producto.id}"
                        data-variant-id="${item.variante?.id ?? ""}"
                        aria-label="Aumentar cantidad"
                        ${item.cantidad >=
                (item.variante
                    ? item.variante.obtenerStock()
                    : item.producto.obtenerStock())
                ? "disabled"
                : ""}
                      >
                        +
                      </button>
                    </div>
                    <span>${formatCurrency(item.precioUnitario)} c/u</span>
                    <strong>${formatCurrency(item.calcularSubtotal())}</strong>
                  </div>
                </article>
              `)
                .join("");
        this.root.innerHTML = `
      <div class="drawer-backdrop drawer-backdrop--open" data-action="close-cart"></div>
      <aside class="drawer drawer--open" aria-label="Carrito de compras">
        <header class="drawer__header">
          <div>
            <span class="eyebrow">Carrito</span>
            <h2>Resumen de compra</h2>
          </div>
          <button type="button" class="icon-button" data-action="close-cart" aria-label="Cerrar carrito">
            x
          </button>
        </header>

        <div class="drawer__body">
          ${itemsMarkup}
        </div>

        <footer class="drawer__footer">
          <div class="drawer__total">
            <span>Total</span>
            <strong>${formatCurrency(state.carrito.calcularTotal())}</strong>
          </div>
          <button
            type="button"
            class="button button--primary button--wide"
            data-action="checkout"
            ${items.length === 0 ? "disabled" : ""}
          >
            ${state.usuarioActual ? "Finalizar compra" : "Iniciar sesion para pagar"}
          </button>
        </footer>
      </aside>
    `;
    }
}
