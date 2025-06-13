import UserEntitiy, { LoginUserDTO, UserInfo } from "@domain/entities/user";

export interface AuthRepository {
  login: (dto: LoginUserDTO) => Promise<UserEntitiy | null>;
  userInfo: (id: string) => Promise<UserInfo | null>;
  refreshToken: (id: string, refreshId: string) => Promise<UserInfo | null>;
}
