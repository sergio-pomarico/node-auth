import { NextFunction, Request, Response } from "express";
import { LoginPayload } from "@presentation/schemas/login";
import { LoginUserUseCase } from "@domain/use-cases/auth/login-usecase";
import { AuthRepository } from "@domain/repositories/auth-repository";
import { AuthRepositoryImpl } from "@infrastructure/repositories/auth-repository-impl";

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
}
