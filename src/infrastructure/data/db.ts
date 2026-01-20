import { PrismaClient } from "../../../.generated/client";
import { logger } from "@infrastructure/services/logger";
import { AsyncStorageService } from "@infrastructure/services/async-storage";

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    name: "logger",
    query: {
      async $allOperations({ operation, model, args, query }) {
        const requestId = AsyncStorageService.getInstance()
          .getStore()
          ?.get("x-request-id");
        const start = performance.now();
        const result = await query(args);
        const end = performance.now();
        const time = end - start;
        logger.info("Query executed", {
          model,
          operation,
          args,
          time,
          requestId,
          result,
        });
        return result;
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> & typeof global;
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
export default prisma;
export type PrismaSingleton = typeof prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
