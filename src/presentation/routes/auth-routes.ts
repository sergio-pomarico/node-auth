import { Router } from "express";
import { schemaValidation } from "@presentation/middlewares/validation";
import { loginSchema } from "@presentation/schemas/login";
import { AuthController } from "@presentation/controllers/auth-controller";

export class AuthRoutes {
  constructor(public readonly router = Router()) {
    this.controller = new AuthController();
    this.routes();
  }

  private readonly controller: AuthController;

  routes(): void {
    this.router.post(
      "/login",
      schemaValidation(loginSchema),
      this.controller.login
    );
  }
}
