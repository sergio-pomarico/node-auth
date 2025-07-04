import { UserRepository } from "@domain/repositories/user-repository";

export class VerifyUserUseCase {
  constructor(private repository: UserRepository) {}
  run = async (data: {
    userId: string;
    verificationCode: string;
  }): Promise<boolean> => {
    const result = await this.repository.verifyEmail(data);
    return result;
  };
}
