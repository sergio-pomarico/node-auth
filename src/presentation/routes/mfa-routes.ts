import { Router } from "express";
import { MFAController } from "@presentation/controllers/mfa-controller";
import { authMiddleware } from "@presentation/middlewares/authentication";
import container from "@infrastructure/dependencies/mfa-container";

export class MfaRoutes {
  constructor(public readonly router = Router()) {
    this.controller = container.get<MFAController>("MFAController");
    this.routes();
  }

  private readonly controller: MFAController;

  routes(): void {
    this.router.post("/setup", authMiddleware("mfa"), this.controller.setup);
    this.router.post("/verify", authMiddleware("mfa"), this.controller.verify);
    this.router.post(
      "/reset",
      authMiddleware(["mfa", "access"]),
      this.controller.reset
    );
  }
}
