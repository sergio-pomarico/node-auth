import { UserRepository } from "@domain/repositories/user-repository";
import UserEntity, { CreateUserDTO } from "@domain/entities/user";
import { EmailService } from "@presentation/services/email";
import { ParseHTMLTemplate } from "@shared/email-templates";
import { env } from "@shared/config";

export class CreateUserUseCase {
  constructor(
    private repository: UserRepository,
    private emailService = new EmailService()
  ) {}
  run = async (dto: CreateUserDTO): Promise<UserEntity> => {
    const user = await this.repository.create(dto);
    if (!user) throw new Error("User not created");
    await this.sendEmailWithValidation(user!);
    return user!;
  };

  sendEmailWithValidation = async (user: UserEntity) => {
    const url = `${env.server.url}/user/verify/${user.id}/${user.verificationCode}`;
    const template = await ParseHTMLTemplate.parse("verify", {
      name: user.name ?? "",
      URL: url,
    });
    await this.emailService.send({
      htmlBody: template,
      subject: "Validate your email",
      to: user.email,
    });
  };
}
