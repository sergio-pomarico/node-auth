import { NextFunction, Request, Response } from "express";
import { injectable, inject } from "inversify";
import { LoginPayload } from "@presentation/schemas/login";
import { LoginUserUseCase } from "@domain/use-cases/auth/login-usecase";
import { UserInfoUseCase } from "@domain/use-cases/auth/user-info-usecase";
import { RefreshTokenUseCase } from "@domain/use-cases/auth/refresh-token-usecase";
import { LogoutUseCase } from "@domain/use-cases/auth/logout-usescase";

@injectable()
export class AuthController {
  constructor(
    @inject("LoginUserUseCase") private loginUserUseCase: LoginUserUseCase,
    @inject("UserInfoUseCase") private userInfoUseCase: UserInfoUseCase,
    @inject("RefreshTokenUseCase")
    private refreshTokenUseCase: RefreshTokenUseCase,
    @inject("LogoutUseCase")
    private logoutUseCase: LogoutUseCase
  ) {}

  login = async (
    req: Request<{}, {}, LoginPayload>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;
    this.loginUserUseCase
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
    this.userInfoUseCase
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
    this.refreshTokenUseCase
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
    this.logoutUseCase
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
