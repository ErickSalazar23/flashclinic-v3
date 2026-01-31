export interface HttpRequest {
    body: unknown;
    params: Record<string, string>;
    query: Record<string, string>;
}
export interface HttpResponse {
    statusCode: number;
    body: unknown;
}
export type HttpController = (request: HttpRequest) => Promise<HttpResponse>;
export declare function ok(data: unknown): HttpResponse;
export declare function badRequest(error: string): HttpResponse;
export declare function notFound(error: string): HttpResponse;
export declare function serverError(error: string): HttpResponse;
export declare function conflict(error: string): HttpResponse;
