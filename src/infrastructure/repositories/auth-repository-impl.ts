import UserEntity, { LoginUserDTO } from "@domain/entities/user";
import { AuthRepository } from "@domain/repositories/auth-repository";
import prima from "@infrastructure/data/db";
import { Encrypt } from "@shared/encrypt";

export class AuthRepositoryImpl implements AuthRepository {
  constructor() {}
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
      console.error("Error in login:", error);
      return null;
    }
  };
}
