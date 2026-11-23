import { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export const notFound: RequestHandler = (req, _res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
        res.status(400).json({
            message: "Validation failed",
            errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    // MongoDB duplicate key (e.g. same email twice)
    if (err?.code === 11000) {
        const field = Object.keys(err.keyPattern ?? {})[0] ?? "value";
        res.status(409).json({ message: `${field} already exists` });
        return;
    }

    // Invalid MongoDB id format
    if (err?.name === "CastError") {
        res.status(400).json({ message: "Invalid id" });
        return;
    }

    console.error(err);
    res.status(500).json({ message: "Internal server error" });
};