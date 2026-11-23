import { RequestHandler } from "express";
import { ZodTypeAny } from "zod";

// Validates req.body (or req.query) against a Zod schema.
// On failure, Zod throws and the error handler returns a 400.
export const validate =
    (schema: ZodTypeAny, source: "body" | "query" = "body"): RequestHandler =>
        (req, _res, next) => {
            req[source] = schema.parse(req[source]);
            next();
        };