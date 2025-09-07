import { inject, injectable } from "inversify";
import { UserRepository } from "@domain/repositories/user-repository";

@injectable()
export class VerifyUserUseCase {
  constructor(
    @inject("UserRepository")
    private repository: UserRepository
  ) {}
  run = async (data: {
    id: string;
    verificationCode: string;
  }): Promise<boolean> => {
    const result = await this.repository.verifyEmail(data);
    return result;
  };
}
