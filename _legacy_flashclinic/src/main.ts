import { createHttpServer } from "./adapters/http/server";

const PORT = parseInt(process.env.PORT ?? "3000", 10);

const server = createHttpServer(PORT);
server.start();
