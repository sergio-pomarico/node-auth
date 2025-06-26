import { LoginUserDTO } from "@domain/entities/user";
import { ErrorCode } from "@domain/errors/code";
import { AuthRepository } from "@domain/repositories/auth-repository";
import { JWT } from "@shared/jwt";
import AuthenticationError from "@domain/errors/authetication";

export class LoginUserUseCase {
  constructor(private repository: AuthRepository) {}
  run = async (
    dto: LoginUserDTO
  ): Promise<{
    accessToken: string;
    mfaEnabled: boolean;
  }> => {
    // Validate user credentials
    const user = await this.repository.login(dto);

    // Generate tokens
    const accessToken = await JWT.generateToken(
      { id: user?.id, scope: "mfa" },
      "access",
      {
        expiresIn: "5m",
      }
    );
    if (!accessToken) {
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
      accessToken: accessToken,
    };
  };
}
