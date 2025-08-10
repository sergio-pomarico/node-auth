import "reflect-metadata";
import { Container } from "inversify";
import { AuthRepository } from "@domain/repositories/auth-repository";
import { AuthRepositoryImpl } from "@infrastructure/repositories/auth-repository-impl";
import { AuthController } from "@presentation/controllers/auth-controller";
import { LoginUserUseCase } from "@domain/use-cases/auth/login-usecase";
import { LogoutUseCase } from "@domain/use-cases/auth/logout-usescase";
import { RefreshTokenUseCase } from "@domain/use-cases/auth/refresh-token-usecase";
import { UserInfoUseCase } from "@domain/use-cases/auth/user-info-usecase";
import { Logger, logger } from "@infrastructure/services/logger";

const container = new Container();

container.bind<AuthRepository>("AuthRepository").to(AuthRepositoryImpl);
container.bind<AuthController>("AuthController").to(AuthController);
container.bind<LoginUserUseCase>("LoginUserUseCase").to(LoginUserUseCase);
container.bind<LogoutUseCase>("LogoutUseCase").to(LogoutUseCase);
container
  .bind<RefreshTokenUseCase>("RefreshTokenUseCase")
  .to(RefreshTokenUseCase);
container.bind<UserInfoUseCase>("UserInfoUseCase").to(UserInfoUseCase);
container.bind<Logger>("Logger").toConstantValue(logger);

export default container;
