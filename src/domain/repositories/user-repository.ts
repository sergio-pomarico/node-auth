import UserEntitiy, {
  CreateUserDTO,
  ResetPasswordDTO,
  VerifyUserDTO,
} from "@domain/entities/user";

export interface UserRepository {
  create: (dto: CreateUserDTO) => Promise<UserEntitiy | null>;
  verifyEmail: (dto: VerifyUserDTO) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<UserEntitiy | null>;
  resetPassword: (dto: ResetPasswordDTO) => Promise<boolean>;
}
