import * as argon2 from "argon2";

export class Encrypt {
  static async hash(password: string): Promise<string> {
    const hash = await argon2.hash(password);
    return hash;
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    const isMatch = await argon2.verify(password, hash);
    return isMatch;
  }
}
