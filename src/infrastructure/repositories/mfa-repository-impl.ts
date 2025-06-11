import UserEntity, { UserStatusEnum } from "@domain/entities/user";
import AuthenticationError from "@domain/errors/authetication";
import { ErrorCode } from "@domain/errors/code";
import { MFARepository } from "@domain/repositories/mfa-repository";
import prisma from "@infrastructure/data/db";

export class MFARepositoryImpl implements MFARepository {
  verify = async (userId: string): Promise<UserEntity | null> => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw AuthenticationError.userNotFound(
          "User not found",
          "try to find a user that does not exist"
        );
      }
      if (!user.verified || user.status === UserStatusEnum.BLOCKED) {
        throw AuthenticationError.userNotVerified(
          "User not verified or blocked",
          "try to get user info of not verified user or user is blocked"
        );
      }
      return user;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      } else if (error instanceof Error) {
        throw new AuthenticationError(
          "Failed to setup MFA",
          "An error occurred while trying to setup MFA",
          ErrorCode.INTERNAL_SERVER,
          "fail",
          500
        );
      }
      return null;
    }
  };
  setup = async (
    secret: string,
    userId: string
  ): Promise<UserEntity | null> => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw AuthenticationError.userNotFound(
          "User not found",
          "try to find a user that does not exist"
        );
      }
      if (!user.verified || user.status === UserStatusEnum.BLOCKED) {
        throw AuthenticationError.userNotVerified(
          "User not verified or blocked",
          "try to get user info of not verified user or user is blocked"
        );
      }
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
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      } else if (error instanceof Error) {
        throw new AuthenticationError(
          "Failed to setup MFA",
          "An error occurred while trying to setup MFA",
          ErrorCode.INTERNAL_SERVER,
          "fail",
          500
        );
      }
      return null;
    }
  };
  reset = async (userId: string): Promise<boolean> => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw AuthenticationError.userNotFound(
          "User not found",
          "try to find a user that does not exist"
        );
      }
      if (!user.verified || user.status === UserStatusEnum.BLOCKED) {
        throw AuthenticationError.userNotVerified(
          "User not verified or blocked",
          "try to get user info of not verified user or user is blocked"
        );
      }
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          mfaSecret: null,
          mfaEnabled: false,
        },
      });
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      } else if (error instanceof Error) {
        throw new AuthenticationError(
          "Failed to reset MFA",
          "An error occurred while trying to reset MFA",
          ErrorCode.INTERNAL_SERVER,
          "fail",
          500
        );
      }
      return false;
    }
  };
}
