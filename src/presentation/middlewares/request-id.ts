import { NextFunction, Response, Request } from "express";
import { randomUUID } from "node:crypto";
import { AsyncStorageService } from "@infrastructure/services/async-storage";

class RequestIDMiddleware {
  constructor(
    private store = new Map<string, string>(),
    private als = AsyncStorageService.getInstance()
  ) {}
  use = (_: Request, __: Response, next: NextFunction) => {
    const requestId = randomUUID();
    this.store.set("x-request-id", requestId);
    this.als.runWithStore(this.store, () => next());
  };
}

const requestID = new RequestIDMiddleware();

export default requestID;
