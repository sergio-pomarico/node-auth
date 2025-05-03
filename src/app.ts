import { Server } from "@presentation/server";
import { env } from "@shared/config";

(() => {
  main();
})();

async function main() {
  const server = new Server(env.server.port);
  await server.start();
}
