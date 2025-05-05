import { UserController } from "@presentation/controllers/user-controller";
import { Router } from "express";
import { schemaValidation } from "@presentation/middlewares/validation";
import { registerSchema } from "@presentation/schemas/register";
import emailSchema from "@presentation/schemas/forgot-password";

export class UserRoutes {
  constructor(public readonly router = Router()) {
    this.controller = new UserController();
    this.routes();
  }

  private readonly controller: UserController;

  routes(): void {
    this.router.post(
      "/register",
      schemaValidation(registerSchema),
      this.controller.register
    );
    this.router.get(
      "/verify/:userId/:verificationCode",
      this.controller.verify
    );
    this.router.post(
      "/forgot-password",
      schemaValidation(emailSchema),
      this.controller.forgotPassword
    );
  }
}
