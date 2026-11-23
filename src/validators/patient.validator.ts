import { z } from "zod";
import { optionalDate, optionalObjectId, optionalString, paginationFields, phoneSchema } from "./common";

export const createPatientSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    age: z.coerce.number().int().min(0, "Age must be 0 or more").max(130),
    gender: z.enum(["male", "female", "other"]),
    phone: phoneSchema,
    condition: z.string().trim().min(2, "Condition is required").max(150),
    visitDate: optionalDate,
});

// Edit: every field optional, but at least one must be sent.
// Unknown fields (like doctor or _id) are stripped by Zod, so they can't be changed through this route.
export const updatePatientSchema = createPatientSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, "Provide at least one field to update");

export const listPatientsQuerySchema = z.object({
    ...paginationFields,
    search: optionalString,
    condition: optionalString,
    gender: z.preprocess((v) => (v === "" ? undefined : v), z.enum(["male", "female", "other"]).optional()),
    doctor: optionalObjectId,
    from: optionalDate,
    to: optionalDate,
});

export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>;