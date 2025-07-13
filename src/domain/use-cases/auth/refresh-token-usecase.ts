import { inject, injectable } from "inversify";
import AuthenticationError from "@domain/errors/authetication";
import { ErrorCode } from "@domain/errors/code";
import { AuthRepository } from "@domain/repositories/auth-repository";
import { JWT } from "@shared/jwt";

interface DecodedToken {
  iat: number;
  id: string;
  exp: number;
  refreshId: string;
}

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject("AuthRepository")
    private repository: AuthRepository
  ) {}
  run = async (refreshToken: string): Promise<{ accessToken: string }> => {
    // Verify the refresh token
    const decoded = await JWT.verifyToken<DecodedToken>(
      refreshToken,
      "refresh"
    );
    if (!decoded) {
      throw AuthenticationError.invalidCredentials(
        "Invalid refresh token",
        "The provided refresh token is invalid or expired"
      );
    }

    // Check if the user exists
    const user = await this.repository.refreshToken(
      decoded.id,
      decoded.refreshId
    );

    // Generate a new access token
    const accessToken = await JWT.generateToken(
      { id: user?.id, scope: "access" },
      "access",
      { expiresIn: "15m" }
    );

    if (!accessToken) {
      throw new AuthenticationError(
        "Failed to generate access token",
        "can't not generate access because of unexpected error",
        ErrorCode.INTERNAL_SERVER,
        "error",
        500
      );
    }

    return {
      accessToken: accessToken!,
    };
  };
}
