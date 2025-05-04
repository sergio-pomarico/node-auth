export enum ErrorCode {
  BAD_REQUEST = "BAD_REQUEST", // 400
  UNAUTHORIZED = "UNAUTHORIZED", // 401
  FORBIDDEN = "FORBIDDEN", // 403
  NOT_FOUND = "NOT_FOUND", // 404
  INTERNAL_SERVER = "INTERNAL_SERVER", // 500
}

class ErrorDetails {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly description: string
  ) {}
}

export default class HttpError extends Error {
  public readonly error: ErrorDetails;

  private constructor(
    public readonly message: string,
    description: string,
    code: ErrorCode,
    public readonly status: "fail" | "error",
    public readonly statusCode: number
  ) {
    super(message);
    this.error = new ErrorDetails(code, message, description);
    Error.captureStackTrace(this, HttpError);
  }

  static badRequest(
    message: string,
    description: string,
    code: ErrorCode = ErrorCode.BAD_REQUEST
  ): HttpError {
    return new HttpError(message, description, code, "error", 400);
  }

  static unauthorize(
    message: string,
    description: string,
    code: ErrorCode = ErrorCode.UNAUTHORIZED
  ): HttpError {
    return new HttpError(message, description, code, "error", 401);
  }

  static forbiden(
    message: string,
    description: string,
    code: ErrorCode = ErrorCode.FORBIDDEN
  ): HttpError {
    return new HttpError(message, description, code, "error", 403);
  }

  static notFound(
    message: string,
    description: string,
    code: ErrorCode = ErrorCode.NOT_FOUND
  ): HttpError {
    return new HttpError(message, description, code, "error", 404);
  }

  static internalServer(
    description: string,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER,
    message: string = "Internal Server Error"
  ) {
    return new HttpError(message, description, code, "fail", 500);
  }
}
