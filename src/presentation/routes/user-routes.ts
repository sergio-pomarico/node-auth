import { UserController } from "@presentation/controllers/user-controller";
import { Router } from "express";

export class UserRoutes {
  constructor(public readonly router = Router()) {
    this.controller = new UserController();
    this.routes();
  }

  private readonly controller: UserController;

  routes(): void {
    this.router.post("/register", this.controller.register);
  }
}
