import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

function getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is missing. Add it to your .env file.");
    return secret;
}

export function signToken(id: string): string {
    return jwt.sign({ id }, getSecret(), {
        expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"],
    });
}

export function verifyToken(token: string): JwtPayload & { id: string } {
    return jwt.verify(token, getSecret()) as JwtPayload & { id: string };
}