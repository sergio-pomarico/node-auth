import { Router } from "express";
import { UserRoutes } from "./user-routes";
import { AuthRoutes } from "./auth-routes";
import { MfaRoutes } from "./mfa-routes";

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use("/user", new UserRoutes().router);
    router.use("/auth", new AuthRoutes().router);
    router.use("/mfa", new MfaRoutes().router);
    return router;
  }
}
