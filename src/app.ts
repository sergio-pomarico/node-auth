import { Server } from "@presentation/server";

(() => {
  main();
})();

async function main() {
  const server = new Server(3000);
  await server.start();
}
