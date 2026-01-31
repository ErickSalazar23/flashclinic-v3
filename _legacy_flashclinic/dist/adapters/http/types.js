"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.badRequest = badRequest;
exports.notFound = notFound;
exports.serverError = serverError;
exports.conflict = conflict;
function ok(data) {
    return { statusCode: 200, body: data };
}
function badRequest(error) {
    return { statusCode: 400, body: { error } };
}
function notFound(error) {
    return { statusCode: 404, body: { error } };
}
function serverError(error) {
    return { statusCode: 500, body: { error } };
}
function conflict(error) {
    return { statusCode: 409, body: { error } };
}
