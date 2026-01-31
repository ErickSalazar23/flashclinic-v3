import { IncomingMessage, ServerResponse } from "http";
import { HttpRequest, HttpResponse } from "./types";
type RouteHandler = (request: HttpRequest) => Promise<HttpResponse>;
export declare class Router {
    private routes;
    get(path: string, handler: RouteHandler): void;
    post(path: string, handler: RouteHandler): void;
    patch(path: string, handler: RouteHandler): void;
    handle(req: IncomingMessage, res: ServerResponse): Promise<void>;
    private matchRoute;
    private extractParams;
    private parseQueryString;
    private parseBody;
    private sendResponse;
}
export {};
