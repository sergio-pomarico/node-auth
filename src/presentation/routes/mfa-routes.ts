import { Router } from "express";
import { MFAController } from "@presentation/controllers/mfa-controller";
import { authMiddleware } from "@presentation/middlewares/authentication";

export class MfaRoutes {
  constructor(public readonly router = Router()) {
    this.controller = new MFAController();
    this.routes();
  }

  private readonly controller: MFAController;

  routes(): void {
    this.router.post("/setup", authMiddleware("access"), this.controller.setup);
    this.router.post("/verify", authMiddleware("mfa"), this.controller.verify);
    this.router.post("/reset", authMiddleware("access"), this.controller.reset);
  }
}
