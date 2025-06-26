import express, { Application } from "express";
import { IncomingMessage, ServerResponse, Server as HTTPServer } from "http";
import cookieParser from "cookie-parser";
import { AppRoutes } from "./routes/main-routes";
import errorMiddleware from "./middlewares/error";
import cors from "cors";

export class Server {
  public readonly app: Application = express();
  private readonly port: number;
  private listener: HTTPServer<
    typeof IncomingMessage,
    typeof ServerResponse
  > | null = null;

  constructor(port: number) {
    this.port = port;
    this.app.use(
      cors({
        origin: "http://localhost:5173",
        credentials: true,
      })
    );
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use("/", AppRoutes.routes);
    this.app.use(errorMiddleware);
  }

  async start() {
    this.listener = this.app.listen(this.port, () => {
      console.info(`🚀 server run on port ${this.port}`);
    });
  }

  async stop() {
    this.listener?.close();
  }
}
