import { escapeHtml } from "../utils/formatters.js";
export class NotificationView {
    constructor(root) {
        this.root = root;
        this.notifications = [];
    }
    show(message, type = "info") {
        const notification = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            message,
            type
        };
        this.notifications = [notification, ...this.notifications].slice(0, 4);
        this.render();
        window.setTimeout(() => {
            this.notifications = this.notifications.filter((item) => item.id !== notification.id);
            this.render();
        }, 3600);
    }
    render() {
        this.root.innerHTML = this.notifications
            .map((notification) => `
          <article class="toast toast--${notification.type}">
            <strong>${notification.type === "success" ? "Listo" : notification.type === "error" ? "Atencion" : "Aviso"}</strong>
            <span>${escapeHtml(notification.message)}</span>
          </article>
        `)
            .join("");
    }
}
