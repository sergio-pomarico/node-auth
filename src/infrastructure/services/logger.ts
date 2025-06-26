import pino, {
  DestinationStream,
  Logger as PinoLogger,
  transport as PinoTransport,
  levels,
} from "pino";

export class Logger {
  constructor() {
    const transport: DestinationStream = PinoTransport({
      targets: [
        {
          target: "pino-pretty",
          level: "info",
          options: {
            destination: "./log/output.log",
            mkdir: true,
            colorize: false,
            translateTime: "DD:HH:MM:SS",
          },
        },
        {
          target: "pino-pretty",
          level: "debug",
          options: {
            destination: process.stdout.fd,
            colorize: true,
          },
        },
      ],
    });
    this.logger = pino(
      {
        level: levels.labels[levels.values.info],
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

  debug(message: string, args?: unknown) {
    this.logger.debug(args, message);
  }

  trace(message: string, args?: unknown) {
    this.logger.trace(args, message);
  }
}
