export default interface UserEntity {
  id?: string;
  name: string | null;
  lastName: string | null;
  password: string;
  email: string;
  verified: boolean;
  verificationCode: string | null;
  verificationCodeExpiresAt?: Date | null;
  passwordResetCode: string | null;
  passwordResetCodeExpiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateUserDTO = Pick<
  UserEntity,
  "email" | "password" | "name" | "lastName"
>;

export type LoginUserDTO = Pick<UserEntity, "email" | "password">;
export type ForgotPasswordDTO = Pick<UserEntity, "email">;
export type ResetPasswordDTO = Pick<
  UserEntity,
  "password" | "passwordResetCode" | "id"
>;
export type VerifyUserDTO = Pick<UserEntity, "id" | "verificationCode">;
export type UpdateUserDTO = Partial<
  Pick<
    UserEntity,
    | "name"
    | "password"
    | "email"
    | "verified"
    | "verificationCode"
    | "passwordResetCode"
  >
>;

export type UserInfo = Omit<
  UserEntity,
  | "verified"
  | "password"
  | "verificationCode"
  | "passwordResetCode"
  | "verificationCodeExpiresAt"
  | "passwordResetCodeExpiresAt"
>;
