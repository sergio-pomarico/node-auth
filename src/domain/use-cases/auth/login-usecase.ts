import { LoginUserDTO } from "@domain/entities/user";
import AuthenticationError from "@domain/errors/authetication";
import { ErrorCode } from "@domain/errors/code";
import { AuthRepository } from "@domain/repositories/auth-repository";
import { JWT } from "@shared/jwt";

export class LoginUserUseCase {
  constructor(private repository: AuthRepository) {}
  run = async (
    dto: LoginUserDTO
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    // Validate user credentials
    const user = await this.repository.login(dto);
    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      JWT.generateToken({ id: user?.id }, "access", { expiresIn: "15m" }),
      JWT.generateToken({ id: user?.id }, "refresh", { expiresIn: "30d" }),
    ]);
    if (!accessToken || !refreshToken) {
      throw new AuthenticationError(
        "Failed to generate tokens",
        "can't not generate access o refresh tokens",
        ErrorCode.INTERNAL_SERVER,
        "error",
        500
      );
    }
    return {
      accessToken: accessToken!,
      refreshToken: refreshToken!,
    };
  };
}
