import type { ErrorCode } from "./code";

export class ErrorDetails {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly description: string,
  ) {}
}
