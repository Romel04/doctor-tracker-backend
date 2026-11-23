import { RequestHandler } from "express";
import { User } from "../models";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyToken } from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            user?: { id: string; role: string };
        }
    }
}

export const protect = asyncHandler(async (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        throw new AppError("Not authenticated", 401);
    }

    const token = header.split(" ")[1];
    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        throw new AppError("Invalid or expired token", 401);
    }

    const user = await User.findById(payload.id);
    if (!user) throw new AppError("User no longer exists", 401);

    req.user = { id: user.id, role: user.role };
    next();
});

// Authorization: restrict a route to certain roles
export const authorize =
    (...roles: string[]): RequestHandler =>
        (req, _res, next) => {
            if (!req.user || !roles.includes(req.user.role)) {
                return next(new AppError("Forbidden", 403));
            }
            next();
        };