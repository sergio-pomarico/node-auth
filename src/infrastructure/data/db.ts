import { PrismaClient } from "@prisma/client";

const primaClientSingleton = () => {
  return new PrismaClient();
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof primaClientSingleton> & typeof global;
};

const prisma = globalThis.prismaGlobal ?? primaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
