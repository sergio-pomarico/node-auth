import { AsyncLocalStorage } from "async_hooks";

export class AsyncStorageService {
  private als = new AsyncLocalStorage<Map<string, string>>();
  private static instance: AsyncStorageService;

  private constructor() {}

  static getInstance(): AsyncStorageService {
    if (!AsyncStorageService.instance) {
      AsyncStorageService.instance = new AsyncStorageService();
    }
    return AsyncStorageService.instance;
  }

  getStore(): Map<string, string> | undefined {
    return this.als.getStore();
  }

  runWithStore<T>(store: Map<string, string>, fn: () => T): T {
    return this.als.run(store, fn);
  }
}
