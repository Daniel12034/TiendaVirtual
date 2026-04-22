import { AppOrchestrator } from "./AppOrchestrator.js";

document.addEventListener("DOMContentLoaded", () => {
  const app = new AppOrchestrator(document);
  app.initialize();
});
