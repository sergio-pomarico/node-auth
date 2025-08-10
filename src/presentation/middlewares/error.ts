import AppError from "@domain/errors/app";
import { NextFunction, Response, Request } from "express";
import { Logger } from "@infrastructure/services/logger";
const logger = new Logger();

const errorMiddleware = (
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  if (err instanceof AppError) {
    if (err.status === "fail" || err.statusCode >= 500) {
      logger.fatal(err.message, {
        status: err.status,
        statusCode: err.statusCode,
        stack: err.stack,
      });
      res.status(err.statusCode).json({
        ...err,
        error: { ...err.error, message: "An unexpected error has occurred" },
      });
    }
    res.status(err.statusCode).json(err);
  }
};

export default errorMiddleware;
