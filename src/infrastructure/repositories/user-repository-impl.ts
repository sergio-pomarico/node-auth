import UserEntity, { CreateUserDTO } from "@domain/entities/user";
import { UserRepository } from "@domain/repositories/user-repository";
import prima from "@infrastructure/data/db";
import { Encrypt } from "@shared/encrypt";

export class UserRepositoryImpl implements UserRepository {
  constructor() {}

  create = async (dto: CreateUserDTO): Promise<UserEntity | null> => {
    try {
      // Check if the user already exists
      const existingUser = await prima.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (existingUser) {
        throw new Error("User already exists");
      }
      // Hash the password before saving
      const hashedPassword = await Encrypt.hash(dto.password);
      const verificationCodeExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ); // 24 hours
      const user: UserEntity | null = await prima.user.create({
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
      return null;
    }
  };
}
