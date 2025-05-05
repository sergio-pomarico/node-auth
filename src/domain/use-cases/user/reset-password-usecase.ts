import { UserRepository } from "@domain/repositories/user-repository";

export class ResetPasswordUseCase {
  constructor(private repository: UserRepository) {}
  run = async (data: {
    userId: string;
    passwordResetCode: string;
    password: string;
  }): Promise<boolean> => {
    const result = await this.repository.resetPassword(data);
    return result;
  };
}
