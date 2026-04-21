import { escapeHtml, formatDateTime } from "../utils/formatters.js";
export class PasswordResetPageView {
    constructor(root) {
        this.root = root;
    }
    render(state) {
        const subtitle = state.status === "valid"
            ? `
          <p class="auth-page__support">
            Vas a actualizar la contrasena de <strong>${escapeHtml(state.email ?? "")}</strong>.
            ${state.expiresAt
                ? ` Este enlace vence el ${escapeHtml(formatDateTime(state.expiresAt))}.`
                : ""}
          </p>
        `
            : `
          <p class="auth-page__support">
            ${state.status === "expired"
                ? "El enlace ya vencio."
                : state.status === "used"
                    ? "Este enlace ya fue utilizado."
                    : "No encontramos un enlace de recuperacion valido."}
          </p>
        `;
        const content = state.status === "valid"
            ? `
          <form data-form="reset-password" novalidate>
            <div class="field">
              <label for="reset-password">Nueva contrasena</label>
              <input
                id="reset-password"
                name="password"
                type="password"
                minlength="8"
                autocomplete="new-password"
              />
            </div>

            <div class="field">
              <label for="reset-confirm-password">Confirmar contrasena</label>
              <input
                id="reset-confirm-password"
                name="confirmPassword"
                type="password"
                minlength="8"
                autocomplete="new-password"
              />
            </div>

            <div class="auth-page__actions">
              <button type="submit" class="button button--primary">
                Guardar nueva contrasena
              </button>
              <button
                type="button"
                class="button button--ghost"
                data-action="go-login"
              >
                Volver al acceso
              </button>
            </div>
          </form>
        `
            : `
          <div class="auth-page__actions">
            <button
              type="button"
              class="button button--primary"
              data-action="go-recovery"
            >
              Solicitar otro enlace
            </button>
            <button
              type="button"
              class="button button--ghost"
              data-action="go-login"
            >
              Ir a iniciar sesion
            </button>
          </div>
        `;
        this.root.innerHTML = `
      <section class="auth-page">
        <div class="section-header">
          <div>
            <span class="eyebrow">Recuperacion</span>
            <h1>Restablece tu acceso</h1>
          </div>
        </div>

        <article class="auth-card auth-card--single">
          <h2>Enlace de recuperacion</h2>
          ${subtitle}
          ${content}
        </article>
      </section>
    `;
    }
}
