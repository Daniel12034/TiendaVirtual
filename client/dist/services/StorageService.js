import { Carrito } from "../models/Carrito.js";
class MemoryStorage {
    constructor() {
        this.data = new Map();
    }
    getItem(key) {
        return this.data.get(key) ?? null;
    }
    setItem(key, value) {
        this.data.set(key, value);
    }
    removeItem(key) {
        this.data.delete(key);
    }
}
export class StorageService {
    constructor(storageKey = "ecommerce_carrito", storage) {
        this.storageKey = storageKey;
        this.storage = storage ?? this.resolveStorage();
    }
    saveCart(carrito) {
        const snapshot = carrito.toSnapshot();
        this.storage.setItem(this.storageKey, JSON.stringify(snapshot));
    }
    loadCart(catalogoProductos = []) {
        const data = this.storage.getItem(this.storageKey);
        if (!data) {
            return null;
        }
        try {
            const snapshot = JSON.parse(data);
            return Carrito.fromSnapshot(snapshot, catalogoProductos);
        }
        catch {
            this.clearCart();
            return null;
        }
    }
    clearCart() {
        this.storage.removeItem(this.storageKey);
    }
    resolveStorage() {
        if (typeof globalThis.localStorage !== "undefined") {
            return globalThis.localStorage;
        }
        return new MemoryStorage();
    }
}
