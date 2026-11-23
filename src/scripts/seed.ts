import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models";

async function seed() {
    const email = process.env.ADMIN_EMAIL?.toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    }

    await connectDB();

    const hashed = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate(
        { email },
        { name: "Admin", email, password: hashed, role: "admin" },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Admin ready: ${email}`);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
});