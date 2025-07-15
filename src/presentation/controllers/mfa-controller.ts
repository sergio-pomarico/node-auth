import { inject, injectable } from "inversify";
import { ResetMFAUserUseCase } from "@domain/use-cases/mfa/reset-mfa-usecase";
import { SetupMFAUserUseCase } from "@domain/use-cases/mfa/setup-mfa-usecase";
import { VerifyMFAUserUseCase } from "@domain/use-cases/mfa/verify-mfa-usecase";
import { NextFunction, Request, Response } from "express";

@injectable()
export class MFAController {
  constructor(
    @inject("SetupMFAUserUseCase")
    private setupMFAUserUseCase: SetupMFAUserUseCase,
    @inject("ResetMFAUserUseCase")
    private resetMFAUserUseCase: ResetMFAUserUseCase,
    @inject("VerifyMFAUserUseCase")
    private verifyMFAUserUseCase: VerifyMFAUserUseCase
  ) {}
  setup = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    this.setupMFAUserUseCase
      .run(userId)
      .then((data) => {
        res.status(200).json({
          status: "success",
          message: "MFA setup initiated",
          qr: data.qr,
          secret: data.secret,
        });
      })
      .catch((error) => next(error));
  };
  verify = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, token } = req.body;
    this.verifyMFAUserUseCase
      .run(userId, token)
      .then((data) => {
        res.status(200).json({
          status: "success",
          message: "MFA verified successfully",
          credentials: data,
        });
      })
      .catch((error) => next(error));
  };
  reset = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;
    this.resetMFAUserUseCase
      .run(userId)
      .then((result) => {
        res.status(200).json({
          status: result ? "success" : "error",
          message: result ? "MFA reset successfully" : "Failed to reset MFA",
        });
      })
      .catch((error) => next(error));
  };
}
