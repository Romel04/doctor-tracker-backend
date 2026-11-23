import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { Doctor, Patient } from "../models";

const specializations = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology", "Gynecology", "General Medicine", "ENT"];
const hospitals = ["Square Hospital", "United Hospital", "Evercare Hospital", "Labaid Hospital", "Popular Medical College Hospital"];
const doctorNames = [
    "Dr. Anisur Rahman", "Dr. Farhana Islam", "Dr. Mahmudul Hasan", "Dr. Nusrat Jahan",
    "Dr. Tanvir Ahmed", "Dr. Sabrina Karim", "Dr. Rafiqul Alam", "Dr. Mehnaz Chowdhury",
    "Dr. Imran Hossain", "Dr. Shirin Akter", "Dr. Kamrul Hasan", "Dr. Lubna Yasmin",
];
const patientNames = [
    "Rahim Uddin", "Karima Begum", "Sohel Rana", "Nasima Khatun", "Jahid Hasan", "Mitu Akter",
    "Abdul Karim", "Rokeya Sultana", "Faisal Ahmed", "Sharmin Nahar", "Babul Mia", "Taslima Akter",
    "Hasan Mahmud", "Shirin Sultana", "Arif Hossain", "Ruma Begum", "Shahin Alam", "Popy Rani",
    "Mizanur Rahman", "Salma Khatun",
];
const conditions = ["Hypertension", "Diabetes", "Migraine", "Asthma", "Fracture", "Skin Allergy", "Fever", "Back Pain", "Anemia", "Thyroid Disorder"];
const genders = ["male", "female", "other"] as const;

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seedDemo() {
    await connectDB();

    // DEV ONLY: this wipes all doctors and patients before inserting sample data
    await Patient.deleteMany({});
    await Doctor.deleteMany({});

    const doctors = await Doctor.insertMany(
        doctorNames.map((name, i) => ({
            name,
            specialization: specializations[i % specializations.length],
            hospital: hospitals[i % hospitals.length],
            phone: "01711" + String(100000 + i * 137),
            email: `doctor${i + 1}@example.com`,
            createdAt: daysAgo(randInt(0, 60)),
        }))
    );

    const patients = Array.from({ length: 90 }, (_, i) => {
        const visit = daysAgo(randInt(0, 60));
        return {
            name: patientNames[i % patientNames.length],
            age: randInt(3, 85),
            gender: pick(genders),
            phone: "01811" + String(200000 + i * 211),
            condition: pick(conditions),
            visitDate: visit,
            createdAt: visit,
            // squared random skews patients toward the first doctors, so charts look uneven and realistic
            doctor: doctors[Math.floor(Math.random() ** 2 * doctors.length)]._id,
        };
    });
    await Patient.insertMany(patients);

    console.log(`Seeded ${doctors.length} doctors and ${patients.length} patients`);
    await mongoose.disconnect();
}

seedDemo().catch((err) => {
    console.error("Demo seed failed:", err.message);
    process.exit(1);
});