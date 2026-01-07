import type { ErrorCode } from "./code";
import { ErrorDetails } from "./detail";

export default class AppError extends Error {
  public readonly error: ErrorDetails;

  constructor(
    public readonly message: string,
    description: string,
    code: ErrorCode,
    public readonly status: "fail" | "error",
    public readonly statusCode: number,
  ) {
    super(message);
    this.error = new ErrorDetails(code, message, description);
  }
}
