import { Schema, model, InferSchemaType } from "mongoose";

const patientSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        age: { type: Number, required: true, min: 0, max: 130 },
        gender: { type: String, enum: ["male", "female", "other"], required: true },
        phone: { type: String, required: true, trim: true },
        condition: { type: String, required: true, trim: true },
        visitDate: { type: Date, default: Date.now },
        doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    },
    { timestamps: true }
);

// A doctor's patient list, newest first (also serves "patients per doctor" counts)
patientSchema.index({ doctor: 1, visitDate: -1 });

// Filter by condition, then by date
patientSchema.index({ condition: 1, visitDate: -1 });

// Date-wise filter and default sort on the patients page
patientSchema.index({ visitDate: -1 });

// Search
patientSchema.index({ name: "text", condition: "text" });

export type IPatient = InferSchemaType<typeof patientSchema>;
export const Patient = model("Patient", patientSchema);