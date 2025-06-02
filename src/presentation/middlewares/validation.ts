import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { fromZodError } from "zod-validation-error";
import HttpError from "@domain/errors/http";
import { ErrorCode } from "@domain/errors/code";

export const schemaValidation =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (result.error) {
      const validationError = fromZodError(result.error);
      const httpError = HttpError.badRequest(
        "the data proveded is invalid",
        validationError.message,
        ErrorCode.BAD_REQUEST
      );
      res.status(400).json(httpError);
    }
    next();
  };
