import { inject, injectable } from "inversify";
import { UserRepository } from "@domain/repositories/user-repository";

@injectable()
export class ResetPasswordUseCase {
  constructor(
    @inject("UserRepository")
    private repository: UserRepository
  ) {}
  run = async (data: {
    userId: string;
    passwordResetCode: string;
    password: string;
  }): Promise<boolean> => {
    const result = await this.repository.resetPassword(data);
    return result;
  };
}
