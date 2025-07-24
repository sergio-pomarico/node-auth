import { AsyncLocalStorage } from "async_hooks";

export class AsyncStorageService {
  private als = new AsyncLocalStorage<Map<string, string>>();

  getStore(): Map<string, string> | undefined {
    return this.als.getStore();
  }

  runWithStore<T>(store: Map<string, string>, fn: () => T): T {
    return this.als.run(store, fn);
  }
}

export const asyncStorageService = new AsyncStorageService();
