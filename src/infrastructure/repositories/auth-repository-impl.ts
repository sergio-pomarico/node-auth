import { injectable } from "inversify";
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

@injectable()
export class AuthRepositoryImpl implements AuthRepository {
  constructor() {}
  logout = async (id: string): Promise<void> => {
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findFirst({
        where: { id },
      })
    );
    if (userError)
      throw new AuthenticationError(
        userError.message,
        "An error occurred while trying to logout",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    if (!user)
      throw AuthenticationError.userNotFound(
        "User not found",
        "try to find a user what does not exist"
      );
    if (!user.verified || user.status === UserStatusEnum.BLOCKED)
      throw AuthenticationError.userNotVerified(
        "User not verified or blocked",
        "try to get user info of not verified user or user is blocked"
      );
    const { error: updateUserError } = await tryCatch(
      prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenId: null },
      })
    );
    if (updateUserError)
      throw new AuthenticationError(
        updateUserError.message,
        "An error occurred while trying to logout",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
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
    if (userError)
      throw new AuthenticationError(
        userError.message,
        "An error occurred while trying to refresh token",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    if (!user) {
      throw AuthenticationError.userNotFound(
        "User not found",
        "try to find a user what does not exist"
      );
    }
    if (!user.verified || user.status === UserStatusEnum.BLOCKED) {
      throw AuthenticationError.userNotVerified(
        "User not verified or blocked",
        "try to get user info of not verified user or user is blocked"
      );
    }
    if (user.refreshTokenId !== refreshId) {
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
    if (userError)
      throw new AuthenticationError(
        userError.message,
        "An error occurred while trying to get user info",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    if (!user) {
      throw AuthenticationError.userNotFound(
        "User not found",
        "try to find a user what does not exist"
      );
    }
    if (!user.verified || user.status === UserStatusEnum.BLOCKED) {
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
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findUnique({
        where: { email: dto.email },
      })
    );
    if (userError)
      throw new AuthenticationError(
        userError.message,
        "An error occurred while trying to login",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    if (!user)
      throw AuthenticationError.userNotFound(
        "User not found",
        "try to find a user what does not exist"
      );
    if (!user.verified || user.status === UserStatusEnum.BLOCKED)
      throw AuthenticationError.userNotVerified(
        "User not verified or blocked",
        "try to get user info of not verified user or user is blocked"
      );
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
