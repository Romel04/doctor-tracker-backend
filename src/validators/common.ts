import { z } from "zod";

// Query strings often arrive as "" (empty filter box). Treat that as "not provided".
const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const optionalString = z.preprocess(emptyToUndefined, z.string().trim().optional());
export const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());

// Person name: letters (any language), spaces, dots, hyphens and apostrophes. No digits or other symbols.
// \p{L} = any letter, \p{M} = combining marks (needed for scripts like Bangla).
export const nameSchema = z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100)
    .regex(/^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u, "Name can only contain letters, spaces, dots, hyphens and apostrophes");

// Bangladeshi mobile format: 11 digits, starting with 01
export const phoneSchema = z
    .string()
    .trim()
    .regex(/^01\d{9}$/, "Phone must be 11 digits and start with 01");

export const paginationFields = {
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
};

export const objectIdString = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");
export const optionalObjectId = z.preprocess(emptyToUndefined, objectIdString.optional());