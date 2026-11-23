import { Schema, model, InferSchemaType } from "mongoose";

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true, // creates a unique index, used for login lookups
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true, select: false }, // hidden from queries by default
        role: { type: String, enum: ["admin"], default: "admin" },
    },
    { timestamps: true }
);

export type IUser = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);