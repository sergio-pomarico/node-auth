import { MFARepository } from "@domain/repositories/mfa-repository";
import { SetupMFAUserUseCase } from "@domain/use-cases/mfa/setup-mfa-usecase";
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
}
