import { MFARepository } from "@domain/repositories/mfa-repository";
import { Secret, TOTP } from "otpauth";
import { toDataURL } from "qrcode";

export class SetupMFAUserUseCase {
  constructor(private repository: MFARepository) {}
  run = async (userId: string): Promise<{ qr: string; secret: string }> => {
    const secret = new Secret({ size: 20 });
    const user = await this.repository.setup(secret.base32, userId);
    const otp = new TOTP({
      issuer: "codeo.co",
      label: user?.email ?? "",
      algorithm: "SHA1",
      digits: 6,
      period: 60,
      secret: secret.base32,
    });
    const uri = otp.toString();
    const qr = await toDataURL(uri);
    return {
      qr,
      secret: secret.base32,
    };
  };
}
