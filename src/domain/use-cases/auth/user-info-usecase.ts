import { inject, injectable } from "inversify";
import { UserInfo } from "@domain/entities/user";
import { AuthRepository } from "@domain/repositories/auth-repository";

@injectable()
export class UserInfoUseCase {
  constructor(
    @inject("AuthRepository")
    private repository: AuthRepository
  ) {}
  run = async (id: string): Promise<UserInfo | null> => {
    const user = await this.repository.userInfo(id);
    return user;
  };
}
