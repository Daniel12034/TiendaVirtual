import { Cliente } from "../models/Cliente.js";
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
export class FrontendDataService {
    constructor(usersKey = "ecommerce_usuarios", currentUserKey = "ecommerce_usuario_actual", recoveryKey = "ecommerce_recuperacion", storage = FrontendDataService.resolveStorage()) {
        this.usersKey = usersKey;
        this.currentUserKey = currentUserKey;
        this.recoveryKey = recoveryKey;
        this.storage = storage;
    }
    loadUsers() {
        const data = this.storage.getItem(this.usersKey);
        if (!data) {
            return [];
        }
        try {
            const snapshots = JSON.parse(data);
            return snapshots.map((snapshot) => Cliente.fromSnapshot(snapshot));
        }
        catch {
            this.storage.removeItem(this.usersKey);
            return [];
        }
    }
    saveUsers(users) {
        const snapshots = Array.from(users, (user) => user.toSnapshot());
        this.storage.setItem(this.usersKey, JSON.stringify(snapshots));
    }
    loadCurrentUserEmail() {
        return this.storage.getItem(this.currentUserKey);
    }
    saveCurrentUserEmail(email) {
        if (!email) {
            this.storage.removeItem(this.currentUserKey);
            return;
        }
        this.storage.setItem(this.currentUserKey, email);
    }
    loadRecoveryRequests() {
        const data = this.storage.getItem(this.recoveryKey);
        if (!data) {
            return [];
        }
        try {
            return JSON.parse(data);
        }
        catch {
            this.storage.removeItem(this.recoveryKey);
            return [];
        }
    }
    saveRecoveryRequests(requests) {
        this.storage.setItem(this.recoveryKey, JSON.stringify(requests));
    }
    static resolveStorage() {
        if (typeof globalThis.localStorage !== "undefined") {
            return globalThis.localStorage;
        }
        return new MemoryStorage();
    }
}
