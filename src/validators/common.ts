import { z } from "zod";

// Query strings often arrive as "" (empty filter box). Treat that as "not provided".
const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const optionalString = z.preprocess(emptyToUndefined, z.string().trim().optional());
export const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());

export const phoneSchema = z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number");

export const paginationFields = {
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
};