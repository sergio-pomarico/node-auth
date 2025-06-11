import { MFARepository } from "@domain/repositories/mfa-repository";

export class ResetMFAUserUseCase {
  constructor(private repository: MFARepository) {}
  run = async (userId: string): Promise<boolean> => {
    const result = await this.repository.reset(userId);
    return result;
  };
}
