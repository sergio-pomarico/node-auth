import "reflect-metadata";
import { Container } from "inversify";
import { UserRepository } from "@domain/repositories/user-repository";
import { UserRepositoryImpl } from "@infrastructure/repositories/user-repository-impl";
import { UserController } from "@presentation/controllers/user-controller";
import { CreateUserUseCase } from "@domain/use-cases/user/create-user-usecase";
import { ForgotPasswordUseCase } from "@domain/use-cases/user/forgot-password-usecase";
import { ResetPasswordUseCase } from "@domain/use-cases/user/reset-password-usecase";
import { VerifyUserUseCase } from "@domain/use-cases/user/verify-user-usecase";
import { UploadProfileImageUseCase } from "@domain/use-cases/user/upload-profile-image-usecase";

const container = new Container();

container.bind<UserRepository>("UserRepository").to(UserRepositoryImpl);
container.bind<UserController>("UserController").to(UserController);
container.bind<CreateUserUseCase>("CreateUserUseCase").to(CreateUserUseCase);
container
  .bind<ForgotPasswordUseCase>("ForgotPasswordUseCase")
  .to(ForgotPasswordUseCase);
container
  .bind<ResetPasswordUseCase>("ResetPasswordUseCase")
  .to(ResetPasswordUseCase);
container.bind<VerifyUserUseCase>("VerifyUserUseCase").to(VerifyUserUseCase);
container
  .bind<UploadProfileImageUseCase>("UploadProfileImageUseCase")
  .to(UploadProfileImageUseCase);

export default container;
