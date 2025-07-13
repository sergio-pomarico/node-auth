import UserEntity, { UserStatusEnum } from "@domain/entities/user";
import AuthenticationError from "@domain/errors/authetication";
import { ErrorCode } from "@domain/errors/code";
import { MFARepository } from "@domain/repositories/mfa-repository";
import { tryCatch } from "@shared/try-catch";
import prisma from "@infrastructure/data/db";

export class MFARepositoryImpl implements MFARepository {
  verify = async (userId: string): Promise<UserEntity | null> => {
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findFirst({
        where: {
          id: userId,
        },
      })
    );
    if (userError)
      throw new AuthenticationError(
        "Failed to setup MFA",
        "An error occurred while trying to setup MFA",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    if (!user)
      throw AuthenticationError.userNotFound(
        "User not found",
        "try to find a user that does not exist"
      );
    if (!user.verified || user.status === UserStatusEnum.BLOCKED)
      throw AuthenticationError.userNotVerified(
        "User not verified or blocked",
        "try to get user info of not verified user or user is blocked"
      );
    return user;
  };
  setup = async (
    secret: string,
    userId: string
  ): Promise<UserEntity | null> => {
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findFirst({
        where: {
          id: userId,
        },
      })
    );
    if (userError)
      throw new AuthenticationError(
        "Failed to setup MFA",
        "An error occurred while trying to setup MFA",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    if (!user)
      throw AuthenticationError.userNotFound(
        "User not found",
        "try to find a user that does not exist"
      );
    if (!user.verified || user.status === UserStatusEnum.BLOCKED)
      throw AuthenticationError.userNotVerified(
        "User not verified or blocked",
        "try to get user info of not verified user or user is blocked"
      );
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        mfaSecret: secret,
        mfaEnabled: true,
      },
    });
    return updatedUser;
  };
  reset = async (userId: string): Promise<boolean> => {
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findFirst({
        where: {
          id: userId,
        },
      })
    );
    if (userError)
      throw new AuthenticationError(
        "Failed to reset MFA",
        "An error occurred while trying to reset MFA",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    if (!user)
      throw AuthenticationError.userNotFound(
        "User not found",
        "try to find a user that does not exist"
      );
    if (!user.verified || user.status === UserStatusEnum.BLOCKED)
      throw AuthenticationError.userNotVerified(
        "User not verified or blocked",
        "try to get user info of not verified user or user is blocked"
      );
    const { error } = await tryCatch(
      prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          mfaSecret: null,
          mfaEnabled: false,
        },
      })
    );
    if (error) return false;
    return true;
  };
}
