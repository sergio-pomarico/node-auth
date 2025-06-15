import { AuthRepository } from "@domain/repositories/auth-repository";

export class LogoutUseCase {
  constructor(private repository: AuthRepository) {}

  run(id: string): Promise<void> {
    return this.repository.logout(id);
  }
}
