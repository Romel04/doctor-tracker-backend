import { Schema, model, InferSchemaType } from "mongoose";

const doctorSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        specialization: { type: String, required: true, trim: true },
        hospital: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
    },
    { timestamps: true }
);

// Search: one text index across the searchable fields
doctorSchema.index(
    { name: "text", specialization: "text", hospital: "text" },
    { weights: { name: 3, specialization: 2, hospital: 1 } }
);

// Filter by specialization / hospital, newest first
doctorSchema.index({ specialization: 1, createdAt: -1 });
doctorSchema.index({ hospital: 1, createdAt: -1 });

// Default list order and date-range filter
doctorSchema.index({ createdAt: -1 });

export type IDoctor = InferSchemaType<typeof doctorSchema>;
export const Doctor = model("Doctor", doctorSchema);