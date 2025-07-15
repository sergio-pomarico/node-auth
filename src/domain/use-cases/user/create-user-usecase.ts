import { inject, injectable } from "inversify";
import { UserRepository } from "@domain/repositories/user-repository";
import UserEntity, { CreateUserDTO } from "@domain/entities/user";
import { EmailService } from "@infrastructure/services/email";
import { ParseHTMLTemplate } from "@shared/email-templates";
import { env } from "@shared/config";

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject("UserRepository")
    private repository: UserRepository,
    private emailService = new EmailService()
  ) {}
  run = async (dto: CreateUserDTO): Promise<UserEntity> => {
    const user = await this.repository.create(dto);
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
