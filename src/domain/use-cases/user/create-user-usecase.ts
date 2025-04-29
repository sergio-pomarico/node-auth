import { UserRepository } from "@domain/repositories/user-repository";
import UserEntity, { CreateUserDTO } from "@domain/entities/user";

export class CreateUserUseCase {
  constructor(private repository: UserRepository) {}
  run = async (dto: CreateUserDTO): Promise<UserEntity> => {
    const todo = await this.repository.create(dto);
    return todo!;
  };
}
