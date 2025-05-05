import { LoginUserDTO } from "@domain/entities/user";
import { AuthRepository } from "@domain/repositories/auth-repository";
import { JWT } from "@shared/jwt";

export class LoginUserUseCase {
  constructor(private repository: AuthRepository) {}
  run = async (dto: LoginUserDTO): Promise<{ accessToken: string }> => {
    const user = await this.repository.login(dto);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    // Generate access token
    const accessToken = await JWT.generateToken(
      {
        id: user?.id,
      },
      "access",
      {
        expiresIn: "15m",
      }
    );
    return {
      accessToken: accessToken!,
    };
  };
}
