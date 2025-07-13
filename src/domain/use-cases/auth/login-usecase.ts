import { inject, injectable } from "inversify";
import { LoginUserDTO } from "@domain/entities/user";
import { ErrorCode } from "@domain/errors/code";
import { AuthRepository } from "@domain/repositories/auth-repository";
import { JWT } from "@shared/jwt";
import { tryCatch } from "@shared/try-catch";
import AuthenticationError from "@domain/errors/authetication";

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject("AuthRepository")
    private repository: AuthRepository
  ) {}
  run = async (
    dto: LoginUserDTO
  ): Promise<{
    accessToken: string;
    mfaEnabled: boolean;
  }> => {
    // Validate user credentials
    const user = await this.repository.login(dto);

    // Generate tokens
    const { data: accessToken, error } = await tryCatch(
      JWT.generateToken({ id: user?.id, scope: "mfa" }, "access", {
        expiresIn: "5m",
      })
    );
    if (error) {
      throw new AuthenticationError(
        "Failed to generate tokens",
        "can't not generate access token",
        ErrorCode.INTERNAL_SERVER,
        "error",
        500
      );
    }
    return {
      mfaEnabled: user?.mfaEnabled ?? false,
      accessToken: accessToken!,
    };
  };
}
