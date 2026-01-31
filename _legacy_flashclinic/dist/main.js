"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./adapters/http/server");
const PORT = parseInt(process.env.PORT ?? "3000", 10);
const server = (0, server_1.createHttpServer)(PORT);
server.start();
