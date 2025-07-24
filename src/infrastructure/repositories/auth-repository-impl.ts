import { inject, injectable } from "inversify";
import UserEntity, {
  LoginUserDTO,
  UserInfo,
  UserStatusEnum,
} from "@domain/entities/user";
import AuthenticationError from "@domain/errors/authetication";
import { ErrorCode } from "@domain/errors/code";
import { AuthRepository } from "@domain/repositories/auth-repository";
import prisma from "@infrastructure/data/db";
import { Encrypt } from "@shared/encrypt";
import { omit } from "@shared/properties";
import { tryCatch } from "@shared/try-catch";
import { nanoid } from "nanoid";
import { Logger } from "@infrastructure/services/logger";
import { asyncStorageService } from "@infrastructure/services/async-storage";

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    @inject("Logger")
    private logger: Logger,
    private als = asyncStorageService
  ) {}
  logout = async (id: string): Promise<void> => {
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findFirst({
        where: { id },
      })
    );
    if (userError) {
      this.logger.error("Error finding user during logout", {
        userId: id,
        error: userError,
      });
      throw new AuthenticationError(
        userError.message,
        "An error occurred while trying to logout",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    }
    if (!user) {
      this.logger.warn("User not found during logout", { userId: id });
      throw AuthenticationError.userNotFound(
        "User not found",
        "try to find a user what does not exist"
      );
    }
    if (!user.verified || user.status === UserStatusEnum.BLOCKED) {
      this.logger.warn("User not verified or blocked during logout", {
        userId: id,
        status: user.status,
      });
      throw AuthenticationError.userNotVerified(
        "User not verified or blocked",
        "try to get user info of not verified user or user is blocked"
      );
    }
    const { error: updateUserError } = await tryCatch(
      prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenId: null },
      })
    );
    if (updateUserError) {
      this.logger.error("Error updating user during logout", {
        userId: id,
        error: updateUserError,
      });
      throw new AuthenticationError(
        updateUserError.message,
        "An error occurred while trying to logout",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    }
    this.logger.info("User logged out successfully", { user });
  };
  refreshToken = async (
    id: string,
    refreshId: string
  ): Promise<UserEntity | null> => {
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findFirst({
        where: { id },
      })
    );
    if (userError) {
      this.logger.error("Error finding user during token refresh", {
        userId: id,
        error: userError,
      });
      throw new AuthenticationError(
        userError.message,
        "An error occurred while trying to refresh token",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    }
    if (!user) {
      this.logger.warn("User not found during token refresh", { userId: id });
      throw AuthenticationError.userNotFound(
        "User not found",
        "try to find a user what does not exist"
      );
    }
    if (!user.verified || user.status === UserStatusEnum.BLOCKED) {
      this.logger.warn("User not verified or blocked during token refresh", {
        userId: id,
        status: user.status,
      });
      throw AuthenticationError.userNotVerified(
        "User not verified or blocked",
        "try to get user info of not verified user or user is blocked"
      );
    }
    if (user.refreshTokenId !== refreshId) {
      this.logger.warn("Invalid refresh token during token refresh", {
        userId: id,
        refreshId,
      });
      throw AuthenticationError.invalidCredentials(
        "Invalid refresh token",
        "The provided refresh token is invalid or expired"
      );
    }
    return user;
  };
  userInfo = async (id: string): Promise<UserInfo | null> => {
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findFirst({
        where: {
          id,
        },
      })
    );
    if (userError) {
      this.logger.error("Error finding user during token info retrieval", {
        userId: id,
        error: userError,
      });
      throw new AuthenticationError(
        userError.message,
        "An error occurred while trying to get user info",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    }
    if (!user) {
      this.logger.warn("User not found during token info retrieval", {
        userId: id,
      });
      throw AuthenticationError.userNotFound(
        "User not found",
        "try to find a user what does not exist"
      );
    }
    if (!user.verified || user.status === UserStatusEnum.BLOCKED) {
      this.logger.warn(
        "User not verified or blocked during token info retrieval",
        {
          userId: id,
          status: user.status,
        }
      );
      throw AuthenticationError.userNotVerified(
        "User not verified or blocked",
        "try to get user info of not verified user or user is blocked"
      );
    }
    const userInfo = omit(user, [
      "verified",
      "password",
      "verificationCode",
      "passwordResetCode",
      "verificationCodeExpiresAt",
      "passwordResetCodeExpiresAt",
      "mfaSecret",
      "refreshTokenId",
    ]);
    return userInfo;
  };
  login = async (dto: LoginUserDTO): Promise<UserEntity | null> => {
    const requestId = this.als.getStore()?.get("xRequestId");
    this.logger.info("Attempting user login", {
      email: dto.email,
      requestId,
    });
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findUnique({
        where: { email: dto.email },
      })
    );
    if (userError) {
      this.logger.error("Error finding user during login", {
        email: dto.email,
        error: userError,
        requestId: requestId,
      });
      throw new AuthenticationError(
        userError.message,
        "An error occurred while trying to login",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    }
    if (!user) {
      this.logger.warn("User not found during login", {
        email: dto.email,
        requestId,
      });
      throw AuthenticationError.userNotFound(
        "Invalid credentials",
        "The email or password provided are incorrect"
      );
    }
    if (!user.verified || user.status === UserStatusEnum.BLOCKED) {
      this.logger.warn("User not verified or blocked during login", {
        userId: user.id,
        status: user.status,
        requestId,
      });
      throw AuthenticationError.userNotVerified(
        "User not verified or blocked",
        "try to get user info of not verified user or user is blocked"
      );
    }
    const isPasswordValid = await Encrypt.compare(user.password, dto.password);
    const userHasRefreshTokenId = user.refreshTokenId !== null;
    if (!isPasswordValid) {
      const failedLoginAttempts = user.failedLoginAttempts + 1;
      await tryCatch(
        prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            failedLoginAttempts: failedLoginAttempts,
            status:
              failedLoginAttempts >= 3 ? UserStatusEnum.BLOCKED : user.status,
          },
        })
      );
      this.logger.warn("Invalid credentials during login", {
        email: dto.email,
        failedLoginAttempts,
      });
      throw AuthenticationError.invalidCredentials(
        "Invalid credentials",
        "The email or password provided are incorrect"
      );
    } else {
      await tryCatch(
        prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            failedLoginAttempts: 0,
            refreshTokenId: userHasRefreshTokenId
              ? user.refreshTokenId
              : nanoid(),
          },
        })
      );
    }
    return user;
  };
}
