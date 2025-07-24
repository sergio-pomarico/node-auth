import { NextFunction, Response, Request } from "express";
import { randomUUID } from "node:crypto";
import { Logger } from "@infrastructure/services/logger";
import { asyncStorageService } from "@infrastructure/services/async-storage";

class RequestIDMiddleware {
  constructor(
    private store = new Map<string, string>(),
    private als = asyncStorageService,
    private logger = new Logger()
  ) {}

  use = (req: Request, __: Response, next: NextFunction) => {
    const requestId = randomUUID();
    const userAgent = req.headers["user-agent"] ?? "";

    req.requestId = requestId;
    this.store.set("xRequestId", requestId);

    this.logger.info("Request received", {
      requestId: req.requestId,
      userAgent,
      ip: req.ip,
    });

    this.als.runWithStore(this.store, () => next());
  };
}

const requestID = new RequestIDMiddleware();

export default requestID;
