import UserEntity, { LoginUserDTO } from "@domain/entities/user";
import { AuthRepository } from "@domain/repositories/auth-repository";
import prima from "@infrastructure/data/db";
import { Encrypt } from "@shared/encrypt";
import { omit } from "@shared/properties";

export class AuthRepositoryImpl implements AuthRepository {
  constructor() {}
  userInfo = async (id: string): Promise<UserEntity | null> => {
    try {
      const user = await prima.user.findFirst({
        where: {
          id,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      const userInfo = omit(user, [
        "verified",
        "password",
        "verificationCode",
        "passwordResetCode",
        "passwordResetCode",
        "verificationCodeExpiresAt",
      ]);
      return userInfo as UserEntity;
    } catch (error) {
      return null;
    }
  };
  login = async (dto: LoginUserDTO): Promise<UserEntity | null> => {
    try {
      const user = await prima.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      if (!user.verified) {
        throw new Error("User not verified");
      }
      const isPasswordValid = await Encrypt.compare(
        user.password,
        dto.password
      );
      if (!isPasswordValid) {
        throw new Error("Email or password is incorrect");
      }
      return user;
    } catch (error) {
      return null;
    }
  };
}
