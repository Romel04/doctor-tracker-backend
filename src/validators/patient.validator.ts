import { z } from "zod";
import { optionalDate, optionalString, paginationFields, phoneSchema } from "./common";

export const createPatientSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    age: z.coerce.number().int().min(0, "Age must be 0 or more").max(130),
    gender: z.enum(["male", "female", "other"]),
    phone: phoneSchema,
    condition: z.string().trim().min(2, "Condition is required").max(150),
    visitDate: optionalDate,
});

export const listPatientsQuerySchema = z.object({
    ...paginationFields,
    search: optionalString,
    condition: optionalString,
    gender: z.preprocess((v) => (v === "" ? undefined : v), z.enum(["male", "female", "other"]).optional()),
    from: optionalDate,
    to: optionalDate,
});

export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>;