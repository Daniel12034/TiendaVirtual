import { AppOrchestrator } from "./AppOrchestrator.js";
document.addEventListener("DOMContentLoaded", () => {
    const app = new AppOrchestrator(document);
    void app.initialize().catch((error) => {
        console.error("No se pudo inicializar la aplicacion:", error);
    });
});
