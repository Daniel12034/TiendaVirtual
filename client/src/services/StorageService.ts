import { CarritoSnapshot } from "../types/domain.js";
import { Carrito } from "../models/Carrito.js";
import { Producto } from "../models/Producto.js";

interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

class MemoryStorage implements KeyValueStorage {
  private readonly data = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  public removeItem(key: string): void {
    this.data.delete(key);
  }
}

export class StorageService {
  private readonly storageKey: string;
  private readonly storage: KeyValueStorage;

  constructor(
    storageKey: string = "ecommerce_carrito",
    storage?: KeyValueStorage
  ) {
    this.storageKey = storageKey;
    this.storage = storage ?? this.resolveStorage();
  }

  public saveCart(carrito: Carrito): void {
    const snapshot = carrito.toSnapshot();
    this.storage.setItem(this.storageKey, JSON.stringify(snapshot));
  }

  public loadCart(catalogoProductos: Producto[] = []): Carrito | null {
    const data = this.storage.getItem(this.storageKey);

    if (!data) {
      return null;
    }

    try {
      const snapshot = JSON.parse(data) as CarritoSnapshot;
      return Carrito.fromSnapshot(snapshot, catalogoProductos);
    } catch {
      this.clearCart();
      return null;
    }
  }

  public clearCart(): void {
    this.storage.removeItem(this.storageKey);
  }

  private resolveStorage(): KeyValueStorage {
    if (typeof globalThis.localStorage !== "undefined") {
      return globalThis.localStorage;
    }

    return new MemoryStorage();
  }
}
