import { Resend } from "resend";

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  attachements?: Attachement[];
}

export interface Attachement {
  filename: string;
  path: string;
}
export class EmailService {
  constructor() {
    this.transporter = new Resend(process.env.RESEND_API_KEY!);
  }

  transporter: Resend;

  send = async (options: SendMailOptions): Promise<boolean> => {
    const { to, subject, htmlBody, attachements = [] } = options;
    const { data } = await this.transporter.emails.send({
      from: "Codeo <hola@codeo.co>",
      to,
      subject,
      html: htmlBody,
      attachments: attachements,
    });
    if (data) return true;
    return false;
  };
}
