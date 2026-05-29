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
export class RuntimeStateService {
    constructor(authKey = "tienda_auth_state", guestCartKey = "tienda_guest_cart_id", storage = RuntimeStateService.resolveStorage()) {
        this.authKey = authKey;
        this.guestCartKey = guestCartKey;
        this.storage = storage;
    }
    loadAuthState() {
        const data = this.storage.getItem(this.authKey);
        if (!data) {
            return null;
        }
        try {
            return JSON.parse(data);
        }
        catch {
            this.storage.removeItem(this.authKey);
            return null;
        }
    }
    saveAuthState(state) {
        if (!state) {
            this.storage.removeItem(this.authKey);
            return;
        }
        this.storage.setItem(this.authKey, JSON.stringify(state));
    }
    loadGuestCartId() {
        return this.storage.getItem(this.guestCartKey);
    }
    saveGuestCartId(cartId) {
        if (!cartId) {
            this.storage.removeItem(this.guestCartKey);
            return;
        }
        this.storage.setItem(this.guestCartKey, cartId);
    }
    static resolveStorage() {
        if (typeof globalThis.localStorage !== "undefined") {
            return globalThis.localStorage;
        }
        return new MemoryStorage();
    }
}
