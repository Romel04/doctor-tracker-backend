import { z } from "zod";
import { optionalDate, optionalString, paginationFields, phoneSchema } from "./common";

export const createDoctorSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    specialization: z.string().trim().min(2, "Specialization is required").max(100),
    hospital: z.string().trim().min(2, "Hospital is required").max(150),
    phone: phoneSchema,
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export const listDoctorsQuerySchema = z.object({
    ...paginationFields,
    search: optionalString,
    specialization: optionalString,
    hospital: optionalString,
    from: optionalDate,
    to: optionalDate,
});

export type ListDoctorsQuery = z.infer<typeof listDoctorsQuerySchema>;