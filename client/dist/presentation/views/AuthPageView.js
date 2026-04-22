import { formatCurrency, formatDateTime, escapeHtml } from "../utils/formatters.js";
export class AuthPageView {
    constructor(root) {
        this.root = root;
    }
    render(state) {
        if (state.usuarioActual) {
            const historialMarkup = state.historial.length === 0
                ? `
            <article class="account-card">
              <p>Aun no tienes compras registradas.</p>
            </article>
          `
                : state.historial
                    .slice()
                    .reverse()
                    .slice(0, 4)
                    .map((pedido) => `
                  <article class="order-card">
                    <div>
                      <strong>Pedido ${escapeHtml(pedido.id.slice(0, 8).toUpperCase())}</strong>
                      <span>${formatDateTime(pedido.fecha)}</span>
                    </div>
                    <strong>${formatCurrency(pedido.total)}</strong>
                  </article>
                `)
                    .join("");
            this.root.innerHTML = `
        <section class="auth-page">
          <div class="section-header">
            <div>
              <span class="eyebrow">Mi cuenta</span>
              <h1>Hola, ${escapeHtml(state.usuarioActual.nombre)}</h1>
            </div>
            <button type="button" class="button button--ghost" data-action="logout">
              Cerrar sesion
            </button>
          </div>

          <div class="account-grid">
            <article class="account-card">
              <h2>Datos de acceso</h2>
              <p>${escapeHtml(state.usuarioActual.email)}</p>
            </article>

            <article class="account-card">
              <h2>Pedidos recientes</h2>
              <div class="order-list">
                ${historialMarkup}
              </div>
            </article>
          </div>
        </section>
      `;
            return;
        }
        this.root.innerHTML = `
      <section class="auth-page">
        <div class="section-header">
          <div>
            <span class="eyebrow">Tu cuenta</span>
            <h1>Ingresa o crea tu cuenta</h1>
          </div>
        </div>

        <div class="auth-tabs" role="tablist" aria-label="Acceso">
          <button
            type="button"
            class="auth-tab ${state.mode === "login" ? "auth-tab--active" : ""}"
            data-action="switch-auth-mode"
            data-mode="login"
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            class="auth-tab ${state.mode === "register" ? "auth-tab--active" : ""}"
            data-action="switch-auth-mode"
            data-mode="register"
          >
            Crear cuenta
          </button>
          <button
            type="button"
            class="auth-tab ${state.mode === "recover" ? "auth-tab--active" : ""}"
            data-action="switch-auth-mode"
            data-mode="recover"
          >
            Recuperar acceso
          </button>
        </div>

        <div class="auth-forms">
          <article class="auth-card ${state.mode === "login" ? "" : "u-hidden"}">
            <h2>Bienvenido otra vez</h2>
            <form data-form="login" novalidate>
              <br>
              <div class="field">
                <label for="login-email">Email</label>
                <input id="login-email" name="email" type="email" autocomplete="email" />
              </div>
              <br>
              <div class="field">
                <label for="login-password">Contrasena</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                />
              </div>
              <br>
              <button type="submit" class="button button--primary button--wide">
                Entrar
              </button>
            </form>

              <br>
            <button
              type="button"
              class="link-button"
              data-action="switch-auth-mode"
              data-mode="recover"
            >
              Olvide mi contrasena
            </button>
          </article>

          <article class="auth-card ${state.mode === "register" ? "" : "u-hidden"}">
            <h2>Crea tu cuenta</h2>
            <form data-form="register" novalidate>
              <br>
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
              <br>

              <button type="submit" class="button button--primary button--wide">
                Crear cuenta
              </button>
            </form>
          </article>

          <article class="auth-card ${state.mode === "recover" ? "" : "u-hidden"}">
            <h2>Recupera tu contrasena</h2>
            <p class="auth-page__support">
              Ingresa tu correo ya registrado.
            </p>
            <p class="auth-page__support">
              (Como esta solucion corre solo en
              frontend, los enlaces enviados quedan visibles en la bandeja local
              de esta misma pantalla.)
            </p>
            <br>
            <form data-form="request-password-reset" novalidate>
              <div class="field">
                <label for="recover-email">Email</label>
                <input id="recover-email" name="email" type="email" autocomplete="email" />
              </div>
            <br>
              <button type="submit" class="button button--primary button--wide">
                Enviar enlace de recuperacion
              </button>
            </form>
          </article>
        </div>

        ${state.recoveryInbox.length > 0
            ? `
              <article class="auth-card auth-card--single">
                <div class="section-panel__header">
                  <div>
                    <span class="eyebrow">Bandeja local</span>
                    <h2>Enlaces enviados</h2>
                  </div>
                </div>

                <div class="recovery-list">
                  ${state.recoveryInbox
                .map((item) => `
                        <article class="recovery-card">
                          <div>
                            <strong>${escapeHtml(item.email)}</strong>
                            <p>
                              ${item.status === "pending"
                ? `Disponible hasta ${escapeHtml(formatDateTime(item.expiresAt))}`
                : item.status === "used"
                    ? "Enlace ya utilizado"
                    : "Enlace vencido"}
                            </p>
                          </div>

                          <a
                            class="button ${item.status === "pending" ? "button--primary" : "button--ghost"}"
                            href="${item.status === "pending" ? item.resetPath : "#/login"}"
                          >
                            ${item.status === "pending" ? "Abrir enlace" : "Volver al acceso"}
                          </a>
                        </article>
                      `)
                .join("")}
                </div>
              </article>
            `
            : ""}
      </section>
    `;
    }
}
