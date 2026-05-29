export interface RuntimeAuthState {
  sessionId: string;
  token: string;
  clienteId: string;
  email: string;
}

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

export class RuntimeStateService {
  constructor(
    private readonly authKey: string = "tienda_auth_state",
    private readonly guestCartKey: string = "tienda_guest_cart_id",
    private readonly storage: KeyValueStorage = RuntimeStateService.resolveStorage()
  ) {}

  public loadAuthState(): RuntimeAuthState | null {
    const data = this.storage.getItem(this.authKey);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as RuntimeAuthState;
    } catch {
      this.storage.removeItem(this.authKey);
      return null;
    }
  }

  public saveAuthState(state: RuntimeAuthState | null): void {
    if (!state) {
      this.storage.removeItem(this.authKey);
      return;
    }

    this.storage.setItem(this.authKey, JSON.stringify(state));
  }

  public loadGuestCartId(): string | null {
    return this.storage.getItem(this.guestCartKey);
  }

  public saveGuestCartId(cartId: string | null): void {
    if (!cartId) {
      this.storage.removeItem(this.guestCartKey);
      return;
    }

    this.storage.setItem(this.guestCartKey, cartId);
  }

  private static resolveStorage(): KeyValueStorage {
    if (typeof globalThis.localStorage !== "undefined") {
      return globalThis.localStorage;
    }

    return new MemoryStorage();
  }
}
