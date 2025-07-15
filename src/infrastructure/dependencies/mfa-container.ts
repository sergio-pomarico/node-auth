import "reflect-metadata";
import { Container } from "inversify";
import { MFARepository } from "@domain/repositories/mfa-repository";
import { MFARepositoryImpl } from "@infrastructure/repositories/mfa-repository-impl";
import { MFAController } from "@presentation/controllers/mfa-controller";
import { ResetMFAUserUseCase } from "@domain/use-cases/mfa/reset-mfa-usecase";
import { SetupMFAUserUseCase } from "@domain/use-cases/mfa/setup-mfa-usecase";
import { VerifyMFAUserUseCase } from "@domain/use-cases/mfa/verify-mfa-usecase";

const container = new Container();

container.bind<MFARepository>("MFARepository").to(MFARepositoryImpl);
container.bind<MFAController>("MFAController").to(MFAController);
container
  .bind<ResetMFAUserUseCase>("ResetMFAUserUseCase")
  .to(ResetMFAUserUseCase);
container
  .bind<SetupMFAUserUseCase>("SetupMFAUserUseCase")
  .to(SetupMFAUserUseCase);
container
  .bind<VerifyMFAUserUseCase>("VerifyMFAUserUseCase")
  .to(VerifyMFAUserUseCase);

export default container;
