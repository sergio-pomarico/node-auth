import { NextFunction, Request, Response } from "express";
import { LoginPayload } from "@presentation/schemas/login";
import { LoginUserUseCase } from "@domain/use-cases/auth/login-usecase";
import { AuthRepository } from "@domain/repositories/auth-repository";
import { AuthRepositoryImpl } from "@infrastructure/repositories/auth-repository-impl";
import { UserInfoUseCase } from "@domain/use-cases/auth/user-info-usecase";
import { RefreshTokenUseCase } from "@domain/use-cases/auth/refresh-token-usecase";
import { LogoutUseCase } from "@domain/use-cases/auth/logout-usescase";

export class AuthController {
  constructor(private repository: AuthRepository = new AuthRepositoryImpl()) {}

  login = async (
    req: Request<{}, {}, LoginPayload>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;
    new LoginUserUseCase(this.repository)
      .run({ email, password })
      .then((data) => {
        res.status(200).json({
          status: "success",
          credentials: data,
        });
      })
      .catch((error) => next(error));
  };
  me = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body?.userId;
    new UserInfoUseCase(this.repository)
      .run(userId)
      .then((user) => {
        res.status(200).json({
          status: "success",
          user,
        });
      })
      .catch((error) => next(error));
  };
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.headers["x-refresh-token"] ?? "";
    new RefreshTokenUseCase(this.repository)
      .run(refreshToken as string)
      .then((data) => {
        res.status(200).json({
          status: "success",
          accessToken: data.accessToken,
        });
      })
      .catch((error) => next(error));
  };
  logout = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.body?.userId;
    new LogoutUseCase(this.repository)
      .run(userId)
      .then(() => {
        res.status(200).json({
          status: "success",
          message: "User logged out successfully",
        });
      })
      .catch((error) => next(error));
  };
}
