import { Router } from "express";
import { UserRoutes } from "./user-routes";
import { AuthRoutes } from "./auth-routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use("/user", new UserRoutes().router);
    router.use("/auth", new AuthRoutes().router);
    return router;
  }
}
