import { IncomingMessage, ServerResponse } from "http";
import { HttpRequest, HttpResponse, notFound, serverError } from "./types";

type RouteHandler = (request: HttpRequest) => Promise<HttpResponse>;

interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];

  get(path: string, handler: RouteHandler): void {
    this.routes.push({ method: "GET", path, handler });
  }

  post(path: string, handler: RouteHandler): void {
    this.routes.push({ method: "POST", path, handler });
  }

  patch(path: string, handler: RouteHandler): void {
    this.routes.push({ method: "PATCH", path, handler });
  }

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const method = req.method ?? "GET";
    const fullUrl = req.url ?? "/";
    const [pathname, queryString] = fullUrl.split("?");

    const match = this.matchRoute(method, pathname);

    if (!match) {
      this.sendResponse(res, notFound(`Ruta no encontrada: ${method} ${pathname}`));
      return;
    }

    try {
      const body = await this.parseBody(req);
      const query = this.parseQueryString(queryString);
      const httpRequest: HttpRequest = { body, params: match.params, query };
      const httpResponse = await match.route.handler(httpRequest);
      this.sendResponse(res, httpResponse);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error interno del servidor";
      this.sendResponse(res, serverError(message));
    }
  }

  private matchRoute(
    method: string,
    pathname: string
  ): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method) continue;

      const params = this.extractParams(route.path, pathname);
      if (params !== null) {
        return { route, params };
      }
    }
    return null;
  }

  private extractParams(
    pattern: string,
    pathname: string
  ): Record<string, string> | null {
    const patternParts = pattern.split("/");
    const pathParts = pathname.split("/");

    if (patternParts.length !== pathParts.length) return null;

    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    return params;
  }

  private parseQueryString(queryString?: string): Record<string, string> {
    if (!queryString) return {};
    const params: Record<string, string> = {};
    const pairs = queryString.split("&");
    for (const pair of pairs) {
      const [key, value] = pair.split("=");
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || "");
      }
    }
    return params;
  }

  private async parseBody(req: IncomingMessage): Promise<unknown> {
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
        } catch {
          reject(new Error("JSON inválido"));
        }
      });
      req.on("error", reject);
    });
  }

  private sendResponse(res: ServerResponse, response: HttpResponse): void {
    res.writeHead(response.statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response.body));
  }
}
