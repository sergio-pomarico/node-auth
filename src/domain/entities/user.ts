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
  failedLoginAttempts?: number;
  status: UserStatus;
  mfaEnabled?: boolean;
  mfaSecret?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserStatus = keyof typeof UserStatusEnum;

export enum UserStatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
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
  | "failedLoginAttempts"
  | "status"
  | "verificationCode"
  | "passwordResetCode"
  | "verificationCodeExpiresAt"
  | "passwordResetCodeExpiresAt"
>;
