import { LoginUserDTO } from "@domain/entities/user";
import { ErrorCode } from "@domain/errors/code";
import { AuthRepository } from "@domain/repositories/auth-repository";
import { JWT } from "@shared/jwt";
import AuthenticationError from "@domain/errors/authetication";

export class LoginUserUseCase {
  constructor(private repository: AuthRepository) {}
  run = async (
    dto: LoginUserDTO
  ): Promise<{ accessToken: string; refreshToken?: string }> => {
    // Validate user credentials
    const user = await this.repository.login(dto);
    // check if mfa is enabled for the user
    if (user?.mfaEnabled ?? false) {
      const accessToken = await JWT.generateToken(
        { id: user?.id, scope: "mfa" },
        "access",
        {
          expiresIn: "5m",
        }
      );
      return {
        accessToken: accessToken!,
      };
    } else {
      // Generate tokens
      const [accessToken, refreshToken] = await Promise.all([
        JWT.generateToken({ id: user?.id, scope: "access" }, "access", {
          expiresIn: "15m",
        }),
        JWT.generateToken(
          { id: user?.id, scope: "refresh", refreshId: user?.refreshTokenId },
          "refresh",
          {
            expiresIn: "30d",
          }
        ),
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
    }
  };
}
