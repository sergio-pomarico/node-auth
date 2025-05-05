import UserEntitiy, { LoginUserDTO } from "@domain/entities/user";

export interface AuthRepository {
  login: (dto: LoginUserDTO) => Promise<UserEntitiy | null>;
}
