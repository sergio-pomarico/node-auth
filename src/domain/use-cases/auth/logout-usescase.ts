import { inject, injectable } from "inversify";
import { AuthRepository } from "@domain/repositories/auth-repository";

@injectable()
export class LogoutUseCase {
  constructor(
    @inject("AuthRepository")
    private repository: AuthRepository
  ) {}

  run(id: string): Promise<void> {
    return this.repository.logout(id);
  }
}
