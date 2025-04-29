import { NextFunction, Request, Response } from "express";
import { CreateUserDTO } from "@domain/entities/user";
import { CreateUserUseCase } from "@domain/use-cases/user/create-user-usecase";
import { UserRepositoryImpl } from "@infrastructure/repositories/user-repository-impl";
import { UserRepository } from "@domain/repositories/user-repository";

export class UserController {
  constructor(private repository: UserRepository = new UserRepositoryImpl()) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, confirmPassword } = req.body;
    const dto: CreateUserDTO = {
      email,
      password,
      confirmPassword,
    };
    new CreateUserUseCase(this.repository)
      .run(dto)
      .then((user) => res.json({ status: "success", user }))
      .catch((error) => next(error));
  };
}
