import { Request, Response, NextFunction } from "express";
import HttpError from "@domain/errors/http";
import { JWT } from "@shared/jwt";

interface DecodedToken {
  iat: number;
  id: string;
  exp: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization: token } = req.headers;

  const error = HttpError.unauthorize(
    "User not verified",
    "request unauthorized"
  );

  if (token) {
    const payload = await JWT.verifyToken<DecodedToken>(token, "access");
    if (!payload) {
      res.status(401).send(error);
    } else {
      if (req.body) {
        req.body.userId = payload.id;
      } else {
        req.body = {};
        req.body.userId = payload.id;
      }
      next();
    }
  } else {
    res.status(401).send(error);
  }
};
