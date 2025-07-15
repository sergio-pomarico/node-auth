import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import { CreateUserDTO } from "@domain/entities/user";
import { CreateUserUseCase } from "@domain/use-cases/user/create-user-usecase";
import { UserRepository } from "@domain/repositories/user-repository";
import { RegisterPayload } from "@presentation/schemas/register";
import { VerifyUserUseCase } from "@domain/use-cases/user/verify-user-usecase";
import { ForgotPasswordUseCase } from "@domain/use-cases/user/forgot-password-usecase";
import { ForgotPasswordPayload } from "@presentation/schemas/forgot-password";
import { ResetPasswordPayload } from "@presentation/schemas/reset-password";
import { ResetPasswordUseCase } from "@domain/use-cases/user/reset-password-usecase";

@injectable()
export class UserController {
  constructor(
    @inject("UserRepository")
    private repository: UserRepository,
    @inject("CreateUserUseCase") private createUserUseCase: CreateUserUseCase,
    @inject("VerifyUserUseCase") private verifyUserUseCase: VerifyUserUseCase,
    @inject("ForgotPasswordUseCase")
    private forgotPasswordUseCase: ForgotPasswordUseCase,
    @inject("ResetPasswordUseCase")
    private resetPasswordUseCase: ResetPasswordUseCase
  ) {}

  register = async (
    req: Request<{}, {}, RegisterPayload>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password, name, lastName } = req.body;
    const dto: CreateUserDTO = {
      email,
      password,
      name,
      lastName,
    };
    this.createUserUseCase
      .run(dto)
      .then((user) =>
        res.json({
          status: "success",
          message: `Verification email sended to ${user.email}`,
        })
      )
      .catch((error) => next(error));
  };

  verify = async (
    req: Request<{ userId: string; verificationCode: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { userId, verificationCode } = req.params;
    this.verifyUserUseCase
      .run({ userId, verificationCode })
      .then((result) =>
        res.json({
          status: result ? "success" : "error",
          message: result ? "User verify successfully" : "User not verify",
        })
      )
      .catch((error) => next(error));
  };

  forgotPassword = async (
    req: Request<{}, {}, ForgotPasswordPayload>,
    res: Response,
    next: NextFunction
  ) => {
    const { email } = req.body;
    this.forgotPasswordUseCase
      .run(email)
      .then(() =>
        res.json({
          status: "success",
          message:
            "Forgot password email sended to your email, please check it",
        })
      )
      .catch((error) => next(error));
  };

  resetPassword = async (
    req: Request<
      { userId: string; passwordResetCode: string },
      {},
      ResetPasswordPayload
    >,
    res: Response,
    next: NextFunction
  ) => {
    const { userId, passwordResetCode } = req.params;
    const { password } = req.body;
    this.resetPasswordUseCase
      .run({ userId, passwordResetCode, password })
      .then((result) =>
        res.json({
          status: result ? "success" : "error",
          message: result
            ? "Password reset successfully"
            : "Password not reset",
        })
      )
      .catch((error) => next(error));
  };
}
