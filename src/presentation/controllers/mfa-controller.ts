import { MFARepository } from "@domain/repositories/mfa-repository";
import { SetupMFAUserUseCase } from "@domain/use-cases/mfa/setup-mfa-usecase";
import { VerifyMFAUserUseCase } from "@domain/use-cases/mfa/verify-mfa-usecase";
import { MFARepositoryImpl } from "@infrastructure/repositories/mfa-repository-impl";
import { NextFunction, Request, Response } from "express";

export class MFAController {
  constructor(private repository: MFARepository = new MFARepositoryImpl()) {}
  setup = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body; // Assuming user ID is stored in req.user by auth middleware
    new SetupMFAUserUseCase(this.repository)
      .run(userId)
      .then((data) => {
        res.status(200).json({
          status: "success",
          message: "MFA setup initiated",
          qr: data.qr,
        });
      })
      .catch((error) => next(error));
  };
  verify = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, token } = req.body;
    new VerifyMFAUserUseCase(this.repository)
      .run(userId, token)
      .then((data) => {
        res.status(200).json({
          status: "success",
          message: "MFA verified successfully",
          accessToken: data?.accessToken,
          refreshToken: data?.refreshToken,
        });
      })
      .catch((error) => next(error));
  };
}
