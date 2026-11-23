import { FilterQuery } from "mongoose";
import { Patient } from "../models";
import type { IPatient } from "../models/Patient";
import type { ListPatientsQuery } from "../validators/patient.validator";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { dateRange, paginationMeta } from "../utils/query";

const DOCTOR_FIELDS = "name specialization hospital";

export const listPatients = asyncHandler(async (req, res) => {
    const { page, limit, search, condition, gender, doctor, from, to } =
        req.query as unknown as ListPatientsQuery;

    const filter: FilterQuery<IPatient> = {};
    if (search) filter.$text = { $search: search };
    if (condition) filter.condition = condition;
    if (gender) filter.gender = gender;
    if (doctor) filter.doctor = doctor;
    const range = dateRange(from, to);
    if (range) filter.visitDate = range;

    const [patients, total] = await Promise.all([
        Patient.find(filter)
            .sort({ visitDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("doctor", DOCTOR_FIELDS) // adds the doctor's name etc. to each patient
            .lean(),
        Patient.countDocuments(filter),
    ]);

    res.json({ data: patients, pagination: paginationMeta(total, page, limit) });
});

export const getPatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id).populate("doctor", DOCTOR_FIELDS).lean();
    if (!patient) throw new AppError("Patient not found", 404);
    res.json({ patient });
});

export const updatePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // return the updated document
        runValidators: true,
    }).populate("doctor", DOCTOR_FIELDS);
    if (!patient) throw new AppError("Patient not found", 404);
    res.json({ patient });
});

export const deletePatient = asyncHandler(async (req, res) => {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) throw new AppError("Patient not found", 404);
    res.json({ message: "Patient deleted" });
});

// Values for the condition filter dropdown
export const listConditions = asyncHandler(async (_req, res) => {
    const conditions = await Patient.distinct("condition");
    res.json({ conditions: conditions.sort() });
});