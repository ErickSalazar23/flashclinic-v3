"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const types_1 = require("./types");
class Router {
    constructor() {
        this.routes = [];
    }
    get(path, handler) {
        this.routes.push({ method: "GET", path, handler });
    }
    post(path, handler) {
        this.routes.push({ method: "POST", path, handler });
    }
    patch(path, handler) {
        this.routes.push({ method: "PATCH", path, handler });
    }
    async handle(req, res) {
        const method = req.method ?? "GET";
        const fullUrl = req.url ?? "/";
        const [pathname, queryString] = fullUrl.split("?");
        const match = this.matchRoute(method, pathname);
        if (!match) {
            this.sendResponse(res, (0, types_1.notFound)(`Ruta no encontrada: ${method} ${pathname}`));
            return;
        }
        try {
            const body = await this.parseBody(req);
            const query = this.parseQueryString(queryString);
            const httpRequest = { body, params: match.params, query };
            const httpResponse = await match.route.handler(httpRequest);
            this.sendResponse(res, httpResponse);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Error interno del servidor";
            this.sendResponse(res, (0, types_1.serverError)(message));
        }
    }
    matchRoute(method, pathname) {
        for (const route of this.routes) {
            if (route.method !== method)
                continue;
            const params = this.extractParams(route.path, pathname);
            if (params !== null) {
                return { route, params };
            }
        }
        return null;
    }
    extractParams(pattern, pathname) {
        const patternParts = pattern.split("/");
        const pathParts = pathname.split("/");
        if (patternParts.length !== pathParts.length)
            return null;
        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(":")) {
                params[patternParts[i].slice(1)] = pathParts[i];
            }
            else if (patternParts[i] !== pathParts[i]) {
                return null;
            }
        }
        return params;
    }
    parseQueryString(queryString) {
        if (!queryString)
            return {};
        const params = {};
        const pairs = queryString.split("&");
        for (const pair of pairs) {
            const [key, value] = pair.split("=");
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || "");
            }
        }
        return params;
    }
    async parseBody(req) {
        return new Promise((resolve, reject) => {
            let data = "";
            req.on("data", (chunk) => {
                data += chunk;
            });
            req.on("end", () => {
                if (data.length === 0) {
                    resolve({});
                    return;
                }
                try {
                    resolve(JSON.parse(data));
                }
                catch {
                    reject(new Error("JSON inválido"));
                }
            });
            req.on("error", reject);
        });
    }
    sendResponse(res, response) {
        res.writeHead(response.statusCode, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response.body));
    }
}
exports.Router = Router;
