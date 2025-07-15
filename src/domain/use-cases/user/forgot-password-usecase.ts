import { inject, injectable } from "inversify";
import { UserRepository } from "@domain/repositories/user-repository";
import UserEntity from "@domain/entities/user";
import { EmailService } from "@infrastructure/services/email";
import { ParseHTMLTemplate } from "@shared/email-templates";

@injectable()
export class ForgotPasswordUseCase {
  constructor(
    @inject("UserRepository")
    private repository: UserRepository,
    private emailService = new EmailService()
  ) {}
  run = async (email: string): Promise<boolean> => {
    const user = await this.repository.forgotPassword(email);
    this.sendEmailWithResetPasswordCode(user!);
    return true;
  };

  sendEmailWithResetPasswordCode = async (user: UserEntity) => {
    const url = `http://localhost:5173/restore-password/${user.id}`;
    const template = await ParseHTMLTemplate.parse("forgot", {
      name: user.name ?? "",
      URL: url,
      code: user.passwordResetCode!,
    });
    await this.emailService.send({
      htmlBody: template,
      subject: "Validate your email",
      to: user.email,
    });
  };
}
