import { Request, Response, NextFunction } from "express";
import multer from "multer";

import { ErrorCode } from "@domain/errors/code";
import HttpError from "@domain/errors/http";

const upload = multer();
const handler = upload.single("file");

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

const fileError = (message: string) =>
  HttpError.badRequest("File upload error", message, ErrorCode.BAD_REQUEST);

const fileMiddleware =
  (allowedMimeTypes: string[] | string) =>
  (req: Request, res: Response, next: NextFunction) =>
    handler(req, res, (error) => {
      if (error) {
        res.status(400).json(fileError(error.message));
      }
      const file = req.file;
      if (!file) {
        res.status(400).json(fileError("No file uploaded"));
      } else {
        if (!allowedMimeTypes.includes(file.mimetype)) {
          res
            .status(400)
            .json(
              fileError(
                `Invalid file type. Only ${
                  Array.isArray(allowedMimeTypes)
                    ? allowedMimeTypes.join(", ")
                    : allowedMimeTypes
                } files are allowed.`
              )
            );
        }
        if (file.size > MAX_FILE_SIZE) {
          res.status(400).json(fileError("File size exceeds the 1MB limit."));
        }
        next();
      }
    });

export { fileMiddleware };
