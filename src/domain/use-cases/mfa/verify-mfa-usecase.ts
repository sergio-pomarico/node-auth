import { inject, injectable } from "inversify";
import AuthenticationError from "@domain/errors/authetication";
import { ErrorCode } from "@domain/errors/code";
import { MFARepository } from "@domain/repositories/mfa-repository";
import { JWT } from "@shared/jwt";
import { Secret, TOTP } from "otpauth";

@injectable()
export class VerifyMFAUserUseCase {
  constructor(
    @inject("MFARepository")
    private repository: MFARepository
  ) {}
  run = async (
    userId: string,
    token: string
  ): Promise<{ accessToken: string; refreshToken: string } | null> => {
    const user = await this.repository.verify(userId);

    if (user?.mfaSecret === null || !user?.mfaEnabled) {
      throw AuthenticationError.userNotVerified(
        "MFA is required",
        "User has not set up MFA yet"
      );
    }
    const secret = Secret.fromBase32(user?.mfaSecret as string);
    const otp = new TOTP({
      algorithm: "SHA1",
      issuer: "codeo.co",
      label: user?.email ?? "",
      digits: 6,
      period: 60,
      secret,
    });
    const isValidToken = otp.validate({ token, window: 5 });
    if (isValidToken === null) {
      throw AuthenticationError.invalidCredentials(
        "Invalid MFA token",
        "The provided MFA token is invalid"
      );
    }
    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      JWT.generateToken({ id: user?.id, scope: "access" }, "access", {
        expiresIn: "15m",
      }),
      JWT.generateToken(
        { id: user?.id, scope: "refresh", refreshId: user?.refreshTokenId },
        "refresh",
        { expiresIn: "30d" }
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
  };
}
