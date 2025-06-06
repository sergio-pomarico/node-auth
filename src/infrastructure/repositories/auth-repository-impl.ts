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

export class AuthRepositoryImpl implements AuthRepository {
  constructor() {}
  userInfo = async (id: string): Promise<UserInfo | null> => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id,
        },
      });
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
      ]);
      return userInfo;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      } else if (error instanceof Error) {
        throw new AuthenticationError(
          error.message,
          "An error occurred while trying to get user info",
          ErrorCode.INTERNAL_SERVER,
          "fail",
          500
        );
      }
      return null;
    }
  };
  login = async (dto: LoginUserDTO): Promise<UserEntity | null> => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
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
      const isPasswordValid = await Encrypt.compare(
        user.password,
        dto.password
      );
      if (!isPasswordValid) {
        const failedLoginAttempts = user.failedLoginAttempts + 1;
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            failedLoginAttempts: failedLoginAttempts,
            status:
              failedLoginAttempts >= 3 ? UserStatusEnum.BLOCKED : user.status,
          },
        });
        throw AuthenticationError.invalidCredentials(
          "Invalid credentials",
          "The email or password provided are incorrect"
        );
      } else {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            failedLoginAttempts: 0,
            status: UserStatusEnum.ACTIVE,
          },
        });
      }
      return user;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      } else if (error instanceof Error) {
        throw new AuthenticationError(
          error.message,
          "An error occurred while trying to login",
          ErrorCode.INTERNAL_SERVER,
          "fail",
          500
        );
      }
      return null;
    }
  };
}
