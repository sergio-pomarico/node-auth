import UserEntity, {
  CreateUserDTO,
  ResetPasswordDTO,
  VerifyUserDTO,
} from "@domain/entities/user";
import AuthenticationError from "@domain/errors/authetication";
import { ErrorCode } from "@domain/errors/code";
import { UserRepository } from "@domain/repositories/user-repository";
import { Encrypt } from "@shared/encrypt";
import { nanoid } from "nanoid";
import prisma from "@infrastructure/data/db";

export class UserRepositoryImpl implements UserRepository {
  constructor() {}
  resetPassword = async (dto: ResetPasswordDTO): Promise<boolean> => {
    try {
      const user: UserEntity | null = await prisma.user.findUnique({
        where: {
          id: dto.id,
        },
      });
      if (!user) {
        throw AuthenticationError.userNotFound(
          "Could not verify user",
          "try to find a user what does not exist"
        );
      }
      if (!user.verified) {
        throw AuthenticationError.userNotVerified(
          "User not verified",
          "try to get user info of not verified user"
        );
      }
      if (user.passwordResetCode !== dto.passwordResetCode) {
        AuthenticationError.invalidCredentials(
          "Invalid credentials",
          "The provided password or reset code is invalid or expired"
        );
      }

      if (user.passwordResetCodeExpiresAt! < new Date()) {
        AuthenticationError.invalidCredentials(
          "Invalid credentials",
          "The provided password or reset code is invalid or expired"
        );
      }

      const hashedPassword = await Encrypt.hash(dto.password);
      // Update the user with the new password
      await prisma.user.update({
        where: {
          id: dto.id,
        },
        data: {
          password: hashedPassword,
          passwordResetCode: null,
          passwordResetCodeExpiresAt: null,
        },
      });
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      } else if (error instanceof Error) {
        throw new AuthenticationError(
          "An error occurred while resetting the password",
          "An unexpected error occurred while trying to reset the password",
          ErrorCode.INTERNAL_SERVER,
          "fail",
          500
        );
      }
      return false;
    }
  };
  verifyEmail = async (dto: VerifyUserDTO): Promise<boolean> => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: dto.id,
        },
      });

      if (!user) {
        throw AuthenticationError.userNotFound(
          "Could not verify user",
          "try to find a user what does not exist"
        );
      }
      if (user.verified) {
        throw new AuthenticationError(
          "User already verified",
          "The user is already verified, no need to verify again",
          ErrorCode.FORBIDDEN,
          "error",
          403
        );
      }
      if (user.verificationCode !== dto.verificationCode) {
        AuthenticationError.invalidCredentials(
          "Invalid verification code",
          "The provided verification code is invalid or expired"
        );
      }
      if (user.verificationCodeExpiresAt! < new Date()) {
        AuthenticationError.invalidCredentials(
          "Invalid verification code",
          "The provided verification code is invalid or expired"
        );
      }
      // Update the user to set verified to true
      await prisma.user.update({
        where: {
          id: dto.id,
        },
        data: {
          verified: true,
          verificationCode: null,
          verificationCodeExpiresAt: null,
        },
      });
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      } else if (error instanceof Error) {
        throw new AuthenticationError(
          "An error occurred while verifying the user",
          "An unexpected error occurred while trying to verify the user",
          ErrorCode.INTERNAL_SERVER,
          "fail",
          500
        );
      }
      return false;
    }
  };

  create = async (dto: CreateUserDTO): Promise<UserEntity | null> => {
    try {
      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (existingUser) {
        throw new AuthenticationError(
          "User already exists",
          "The user with this email already exists",
          ErrorCode.FORBIDDEN,
          "error",
          403
        );
      }
      // Hash the password before saving
      const hashedPassword = await Encrypt.hash(dto.password);
      const verificationCodeExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ); // 24 hours
      const user: UserEntity | null = await prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          lastName: dto.lastName,
          verified: false,
          verificationCodeExpiresAt, // 24 hours
        },
      });
      return user;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      } else if (error instanceof Error) {
        throw new AuthenticationError(
          "An error occurred while creating the user",
          "An unexpected error occurred while trying to create the user",
          ErrorCode.INTERNAL_SERVER,
          "fail",
          500
        );
      }
      return null;
    }
  };

  forgotPassword = async (email: string): Promise<UserEntity | null> => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        throw AuthenticationError.userNotFound(
          "User not found",
          "try to find a user what does not exist"
        );
      }
      if (!user.verified) {
        throw AuthenticationError.userNotVerified(
          "User not verified",
          "try to get user info of not verified user"
        );
      }
      // Generate a new password reset token
      const passwordResetCode = nanoid();
      const passwordResetCodeExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

      const updatedUser = await prisma.user.update({
        where: {
          email,
        },
        data: {
          passwordResetCode,
          passwordResetCodeExpiresAt,
        },
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      } else if (error instanceof Error) {
        throw new AuthenticationError(
          "An error occurred while requesting password reset",
          "An unexpected error occurred while trying to request password reset",
          ErrorCode.INTERNAL_SERVER,
          "fail",
          500
        );
      }
      return null;
    }
  };
}
