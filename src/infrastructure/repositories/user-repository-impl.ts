import UserEntity, {
  CreateUserDTO,
  ResetPasswordDTO,
  UserStatusEnum,
  VerifyUserDTO,
} from "@domain/entities/user";
import AuthenticationError from "@domain/errors/authetication";
import { ErrorCode } from "@domain/errors/code";
import { UserRepository } from "@domain/repositories/user-repository";
import { Encrypt } from "@shared/encrypt";
import { nanoid } from "nanoid";
import prisma from "@infrastructure/data/db";
import { tryCatch } from "@shared/try-catch";

export class UserRepositoryImpl implements UserRepository {
  constructor() {}
  resetPassword = async (dto: ResetPasswordDTO): Promise<boolean> => {
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findFirst({
        where: {
          id: dto.id,
        },
      })
    );
    if (userError)
      throw new AuthenticationError(
        "An error occurred while resetting the password",
        "An unexpected error occurred while trying to reset the password",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    if (!user)
      throw AuthenticationError.userNotFound(
        "Could not verify user",
        "try to find a user what does not exist"
      );
    if (!user.verified)
      throw AuthenticationError.userNotVerified(
        "User not verified",
        "try to get user info of not verified user"
      );
    if (user.passwordResetCode !== dto.passwordResetCode)
      AuthenticationError.invalidCredentials(
        "Invalid credentials",
        "The provided password or reset code is invalid or expired"
      );
    if (user.passwordResetCodeExpiresAt! < new Date())
      AuthenticationError.invalidCredentials(
        "Invalid credentials",
        "The provided password or reset code is invalid or expired"
      );

    const hashedPassword = await Encrypt.hash(dto.password);
    // Update the user with the new password
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
        status: UserStatusEnum.ACTIVE,
      },
    });
    return true;
  };
  verifyEmail = async (dto: VerifyUserDTO): Promise<boolean> => {
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findUnique({
        where: {
          id: dto.id,
        },
      })
    );
    if (userError)
      throw new AuthenticationError(
        "An error occurred while verifying the user",
        "An unexpected error occurred while trying to verify the user",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    if (!user)
      throw AuthenticationError.userNotFound(
        "Could not verify user",
        "try to find a user what does not exist"
      );
    if (user.verified)
      throw new AuthenticationError(
        "User already verified",
        "The user is already verified, no need to verify again",
        ErrorCode.FORBIDDEN,
        "error",
        403
      );
    if (user.verificationCode !== dto.verificationCode)
      AuthenticationError.invalidCredentials(
        "Invalid verification code",
        "The provided verification code is invalid or expired"
      );
    if (user.verificationCodeExpiresAt! < new Date())
      AuthenticationError.invalidCredentials(
        "Invalid verification code",
        "The provided verification code is invalid or expired"
      );
    // Update the user to set verified to true
    await prisma.user.update({
      where: {
        id: dto.id,
      },
      data: {
        verificationCode: null,
        verificationCodeExpiresAt: null,
        status: UserStatusEnum.ACTIVE,
      },
    });
    return true;
  };
  create = async (dto: CreateUserDTO): Promise<UserEntity | null> => {
    // Check if the user already exists
    const { data: existingUser, error: existingUserError } = await tryCatch(
      prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      })
    );
    if (existingUserError)
      throw new AuthenticationError(
        "An error occurred while creating the user",
        "An unexpected error occurred while trying to create the user",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    if (existingUser)
      throw new AuthenticationError(
        "User already exists",
        "The user with this email already exists",
        ErrorCode.FORBIDDEN,
        "error",
        403
      );
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
  };
  forgotPassword = async (email: string): Promise<UserEntity | null> => {
    const { data: user, error: userError } = await tryCatch(
      prisma.user.findUnique({
        where: {
          email,
        },
      })
    );
    if (userError)
      throw new AuthenticationError(
        "An error occurred while requesting password reset",
        "An unexpected error occurred while trying to request password reset",
        ErrorCode.INTERNAL_SERVER,
        "fail",
        500
      );
    if (!user)
      throw AuthenticationError.userNotFound(
        "User not found",
        "try to find a user what does not exist"
      );
    if (!user.verified)
      throw AuthenticationError.userNotVerified(
        "User not verified",
        "try to get user info of not verified user"
      );
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
  };
}
