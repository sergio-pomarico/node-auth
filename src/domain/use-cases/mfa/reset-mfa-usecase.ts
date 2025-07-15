import { inject, injectable } from "inversify";
import { MFARepository } from "@domain/repositories/mfa-repository";

@injectable()
export class ResetMFAUserUseCase {
  constructor(
    @inject("MFARepository")
    private repository: MFARepository
  ) {}
  run = async (userId: string): Promise<boolean> => {
    const result = await this.repository.reset(userId);
    return result;
  };
}
