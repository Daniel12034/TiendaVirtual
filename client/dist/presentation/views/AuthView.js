import { formatCurrency, formatDateTime, escapeHtml } from "../utils/formatters.js";
export class AuthView {
    constructor(root) {
        this.root = root;
    }
    render(state) {
        if (state.usuarioActual) {
            const historialMarkup = state.historial.length === 0
                ? `<p class="auth__hint">Todavia no tienes pedidos generados en esta sesion.</p>`
                : state.historial
                    .slice()
                    .reverse()
                    .slice(0, 3)
                    .map((pedido) => `
                  <article class="auth__history-item">
                    <strong>Pedido ${escapeHtml(pedido.id.slice(0, 8))}</strong>
                    <div class="auth__hint">${formatDateTime(pedido.fecha)}</div>
                    <div class="auth__hint">Total: ${formatCurrency(pedido.total)}</div>
                  </article>
                `)
                    .join("");
            this.root.innerHTML = `
        <div class="auth">
          <section class="auth__profile" aria-label="Perfil del cliente">
            <div class="auth__profile-row">
              <div>
                <p class="panel__eyebrow">Sesion activa</p>
                <h3 class="auth__title">${escapeHtml(state.usuarioActual.nombre)}</h3>
              </div>
              <button type="button" class="button button--ghost" data-action="logout">
                Cerrar sesion
              </button>
            </div>

            <div class="auth__card">
              <div class="auth__name">${escapeHtml(state.usuarioActual.email)}</div>
              <p class="auth__hint">
                La sesion se renueva con cada interaccion valida. Expira el
                ${state.sesionExpiracion ? ` ${formatDateTime(state.sesionExpiracion)}` : " proximo intento de uso"}.
              </p>
            </div>
          </section>

          <section class="auth__card" aria-label="Historial de compras">
            <p class="panel__eyebrow">Cliente</p>
            <h3 class="auth__title">Historial reciente</h3>
            <div class="auth__history">
              ${historialMarkup}
            </div>
          </section>
        </div>
      `;
            return;
        }
        this.root.innerHTML = `
      <div class="auth">
        <section class="auth__card" aria-labelledby="login-title">
          <p class="panel__eyebrow">Acceso rapido</p>
          <h3 id="login-title" class="auth__title">Iniciar sesion</h3>
          <p class="auth__hint">
            Validacion inmediata del formulario para iniciar en menos de 1.5 segundos.
          </p>

          <form data-form="login" novalidate>
            <div class="field">
              <label for="login-email">Email</label>
              <input id="login-email" name="email" type="email" autocomplete="email" />
            </div>

            <div class="field">
              <label for="login-password">Contrasena</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autocomplete="current-password"
              />
            </div>

            <button type="submit" class="button button--secondary">Entrar</button>
          </form>
        </section>

        <section class="auth__card" aria-labelledby="register-title">
          <p class="panel__eyebrow">Nuevo cliente</p>
          <h3 id="register-title" class="auth__title">Crear cuenta</h3>
          <p class="auth__hint">
            Validamos nombre, email, fecha de nacimiento y contrasena antes de instanciar el usuario.
          </p>

          <form data-form="register" novalidate>
            <div class="field">
              <label for="register-name">Nombre</label>
              <input id="register-name" name="nombre" type="text" autocomplete="name" />
            </div>

            <div class="field">
              <label for="register-email">Email</label>
              <input id="register-email" name="email" type="email" autocomplete="email" />
            </div>

            <div class="field">
              <label for="register-password">Contrasena</label>
              <input
                id="register-password"
                name="password"
                type="password"
                minlength="8"
                autocomplete="new-password"
              />
            </div>

            <div class="field">
              <label for="register-birthdate">Fecha de nacimiento</label>
              <input id="register-birthdate" name="fechaNacimiento" type="date" />
            </div>

            <button type="submit" class="button button--primary">Registrarme</button>
          </form>

          <div class="auth__demo">
            Cuenta demo: <strong>${escapeHtml(state.credencialesDemo.email)}</strong><br />
            Contrasena: <strong>${escapeHtml(state.credencialesDemo.password)}</strong>
          </div>
        </section>
      </div>
    `;
    }
}
