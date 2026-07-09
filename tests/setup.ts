// jsdom 29 + vitest 4 don't wire up a working Web Storage (localStorage is a
// prototype-less empty object). Install a spec-compliant in-memory Storage so
// the guarded useLocalStorage / sfx code paths behave like a real browser.
import { afterEach } from "vitest";

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

function install(name: "localStorage" | "sessionStorage") {
  const current = (globalThis as Record<string, unknown>)[name] as Storage | undefined;
  if (!current || typeof current.getItem !== "function") {
    const storage = new MemoryStorage();
    Object.defineProperty(globalThis, name, { value: storage, configurable: true, writable: true });
    if (typeof window !== "undefined") {
      Object.defineProperty(window, name, { value: storage, configurable: true, writable: true });
    }
  }
}

install("localStorage");
install("sessionStorage");

afterEach(() => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {}
});
