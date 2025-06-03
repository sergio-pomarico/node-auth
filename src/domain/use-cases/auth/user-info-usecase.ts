import { UserInfo } from "@domain/entities/user";
import { AuthRepository } from "@domain/repositories/auth-repository";

export class UserInfoUseCase {
  constructor(private repository: AuthRepository) {}
  run = async (id: string): Promise<UserInfo | null> => {
    const user = await this.repository.userInfo(id);
    return user;
  };
}
