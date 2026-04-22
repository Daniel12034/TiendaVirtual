import {
  ClienteSnapshot,
  PasswordRecoveryRequestSnapshot
} from "../types/domain.js";
import { Cliente } from "../models/Cliente.js";

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

export class FrontendDataService {
  constructor(
    private readonly usersKey: string = "ecommerce_usuarios",
    private readonly currentUserKey: string = "ecommerce_usuario_actual",
    private readonly recoveryKey: string = "ecommerce_recuperacion",
    private readonly storage: KeyValueStorage = FrontendDataService.resolveStorage()
  ) {}

  public loadUsers(): Cliente[] {
    const data = this.storage.getItem(this.usersKey);

    if (!data) {
      return [];
    }

    try {
      const snapshots = JSON.parse(data) as ClienteSnapshot[];
      return snapshots.map((snapshot) => Cliente.fromSnapshot(snapshot));
    } catch {
      this.storage.removeItem(this.usersKey);
      return [];
    }
  }

  public saveUsers(users: Iterable<Cliente>): void {
    const snapshots = Array.from(users, (user) => user.toSnapshot());
    this.storage.setItem(this.usersKey, JSON.stringify(snapshots));
  }

  public loadCurrentUserEmail(): string | null {
    return this.storage.getItem(this.currentUserKey);
  }

  public saveCurrentUserEmail(email: string | null): void {
    if (!email) {
      this.storage.removeItem(this.currentUserKey);
      return;
    }

    this.storage.setItem(this.currentUserKey, email);
  }

  public loadRecoveryRequests(): PasswordRecoveryRequestSnapshot[] {
    const data = this.storage.getItem(this.recoveryKey);

    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data) as PasswordRecoveryRequestSnapshot[];
    } catch {
      this.storage.removeItem(this.recoveryKey);
      return [];
    }
  }

  public saveRecoveryRequests(
    requests: PasswordRecoveryRequestSnapshot[]
  ): void {
    this.storage.setItem(this.recoveryKey, JSON.stringify(requests));
  }

  private static resolveStorage(): KeyValueStorage {
    if (typeof globalThis.localStorage !== "undefined") {
      return globalThis.localStorage;
    }

    return new MemoryStorage();
  }
}
