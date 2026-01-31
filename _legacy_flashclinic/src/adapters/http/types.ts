import { IncomingMessage, ServerResponse } from "http";

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

export function ok(data: unknown): HttpResponse {
  return { statusCode: 200, body: data };
}

export function badRequest(error: string): HttpResponse {
  return { statusCode: 400, body: { error } };
}

export function notFound(error: string): HttpResponse {
  return { statusCode: 404, body: { error } };
}

export function serverError(error: string): HttpResponse {
  return { statusCode: 500, body: { error } };
}

export function conflict(error: string): HttpResponse {
  return { statusCode: 409, body: { error } };
}
