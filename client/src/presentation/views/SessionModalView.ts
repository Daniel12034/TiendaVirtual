import { SessionModalState } from "../types.js";

export class SessionModalView {
  constructor(private readonly root: HTMLElement) {}

  public render(state: SessionModalState): void {
    if (!state.isOpen) {
      this.root.innerHTML = "";
      return;
    }

    this.root.innerHTML = `
      <div class="modal-backdrop">
        <section class="session-modal" role="dialog" aria-modal="true" aria-labelledby="session-expired-title">
          <span class="eyebrow">Sesion expirada</span>
          <h2 id="session-expired-title">Tu sesion termino por inactividad</h2>
          <p>
            Puedes seguir explorando la tienda o volver a iniciar sesion cuando quieras.
          </p>

          <div class="session-modal__actions">
            <button type="button" class="button button--ghost" data-action="close-session-modal">
              Seguir explorando
            </button>
            <button type="button" class="button button--primary" data-action="session-login">
              Ir a iniciar sesion
            </button>
          </div>
        </section>
      </div>
    `;
  }
}
