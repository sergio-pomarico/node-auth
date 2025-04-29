export default interface UserEntity {
  id?: string;
  name: string | null;
  lastName: string | null;
  password: string;
  email: string;
  verified: boolean;
  verificationCode: string | null;
  passwordResetCode: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateUserDTO = Pick<UserEntity, "email" | "password"> & {
  confirmPassword: string;
};
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
