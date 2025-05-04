import UserEntitiy, { CreateUserDTO } from "@domain/entities/user";

export interface UserRepository {
  create: (dto: CreateUserDTO) => Promise<UserEntitiy | null>;
  verifyEmail: (data: {
    userId: string;
    verificationCode: string;
  }) => Promise<boolean>;
}
