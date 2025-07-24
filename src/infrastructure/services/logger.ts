import pino, {
  DestinationStream,
  Logger as PinoLogger,
  transport as PinoTransport,
  levels,
} from "pino";
import { env } from "@shared/config";

export class Logger {
  constructor() {
    const transport: DestinationStream = PinoTransport({
      targets: [
        {
          target: "@logtail/pino",
          level: "info",
          options: {
            sourceToken: env.server.logtail_key,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            options: {
              endpoint: env.server.logtail_url,
            },
          },
        },
        {
          target: "pino-pretty",
          level: "info",
          options: {
            destination: process.stdout.fd,
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
          },
        },
      ],
    });
    this.logger = pino(
      {
        level: levels.labels[levels.values.info],
        redact: {
          paths: [
            "*.verified",
            "*.password",
            "*.verificationCode",
            "*.passwordResetCode",
            "*.verificationCodeExpiresAt",
            "*.passwordResetCodeExpiresAt",
            "*.mfaSecret",
            "*.refreshTokenId",
          ],
          censor: "**********",
        },
      },
      transport
    );
  }

  private logger: PinoLogger;

  info(message: string, args?: unknown) {
    this.logger.info(args, message);
  }

  warn(message: string, args?: unknown) {
    this.logger.warn(args, message);
  }

  error(message: string, args?: unknown) {
    this.logger.error(args, message);
  }

  fatal(message: string, args?: unknown) {
    this.logger.fatal(args, message);
  }

  debug(message: string, args?: unknown) {
    this.logger.debug(args, message);
  }
}
