import fs from "node:fs";
import path from "node:path";
import jwt from "jsonwebtoken";

export class JWT {
  static generateToken(
    payload: object,
    keyName: "access" | "refresh",
    options?: jwt.SignOptions | undefined,
  ): Promise<string | null> {
    const signingKey = fs.readFileSync(
      path.resolve(__dirname, "../../certs", keyName, "private.pem"),
      "utf-8",
    );
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        signingKey,
        { ...options, algorithm: "RS256" },
        (err, token) => {
          if (err) return resolve(null);
          return resolve(token!);
        },
      );
    });
  }

  static verifyToken<T>(
    token: string,
    keyName: "access" | "refresh",
  ): Promise<T | null> {
    return new Promise((resolve) => {
      const publicKey = fs.readFileSync(
        path.resolve(__dirname, "../../certs", keyName, "public.pem"),
        "utf-8",
      );
      jwt.verify(token, publicKey, (err, decode) => {
        if (err) return resolve(null);
        return resolve(decode as T);
      });
    });
  }
}
