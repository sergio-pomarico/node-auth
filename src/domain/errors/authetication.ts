import AppError from "./app";
import { ErrorCode } from "./code";

export default class AuthenticationError extends AppError {
  constructor(
    public readonly message: string,
    description: string,
    code: ErrorCode,
    public readonly status: "fail" | "error",
    public readonly statusCode: number
  ) {
    super(message, description, code, status, statusCode);
    Error.captureStackTrace(this, AuthenticationError);
  }

  static userNotFound(
    message: string,
    description: string,
    code: ErrorCode = ErrorCode.NOT_FOUND
  ): AuthenticationError {
    return new AuthenticationError(message, description, code, "error", 404);
  }

  static userNotVerified(
    message: string,
    description: string,
    code: ErrorCode = ErrorCode.FORBIDDEN
  ): AuthenticationError {
    return new AuthenticationError(message, description, code, "error", 403);
  }

  static invalidCredentials(
    message: string,
    description: string,
    code: ErrorCode = ErrorCode.BAD_REQUEST
  ): AuthenticationError {
    return new AuthenticationError(message, description, code, "error", 400);
  }

  static mfaRequired(
    message: string,
    description: string,
    code: ErrorCode = ErrorCode.UNAUTHORIZED
  ): AuthenticationError {
    return new AuthenticationError(message, description, code, "fail", 401);
  }
}
