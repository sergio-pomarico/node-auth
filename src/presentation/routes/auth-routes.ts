import { Router } from "express";
import { schemaValidation } from "@presentation/middlewares/validation";
import { loginSchema } from "@presentation/schemas/login";
import { AuthController } from "@presentation/controllers/auth-controller";
import { authMiddleware } from "@presentation/middlewares/authentication";
import container from "@infrastructure/dependencies/auth-container";

export class AuthRoutes {
  constructor(public readonly router = Router()) {
    this.controller = container.get<AuthController>("AuthController");
    this.routes();
  }

  private readonly controller: AuthController;

  routes(): void {
    this.router.post(
      "/login",
      schemaValidation(loginSchema),
      this.controller.login
    );
    this.router.get("/me", authMiddleware("access"), this.controller.me);
    this.router.post("/refresh", this.controller.refreshToken);
    this.router.post(
      "/logout",
      authMiddleware("access"),
      this.controller.logout
    );
  }
}
