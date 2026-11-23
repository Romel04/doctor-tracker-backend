import { FilterQuery } from "mongoose";
import { Doctor, Patient } from "../models";
import type { IDoctor } from "../models/Doctor";
import type { IPatient } from "../models/Patient";
import type { ListDoctorsQuery } from "../validators/doctor.validator";
import type { ListPatientsQuery } from "../validators/patient.validator";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { dateRange, paginationMeta } from "../utils/query";

export const createDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ doctor });
});

export const listDoctors = asyncHandler(async (req, res) => {
    const { page, limit, search, specialization, hospital, from, to } =
        req.query as unknown as ListDoctorsQuery;

    const filter: FilterQuery<IDoctor> = {};
    if (search) filter.$text = { $search: search };
    if (specialization) filter.specialization = specialization;
    if (hospital) filter.hospital = hospital;
    const range = dateRange(from, to);
    if (range) filter.createdAt = range;

    // Run the page query and the total count at the same time
    const [doctors, total] = await Promise.all([
        Doctor.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Doctor.countDocuments(filter),
    ]);

    // One grouped query for all doctors on this page (instead of one count query per doctor)
    const counts = await Patient.aggregate([
        { $match: { doctor: { $in: doctors.map((d) => d._id) } } },
        { $group: { _id: "$doctor", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count as number]));

    res.json({
        data: doctors.map((d) => ({ ...d, patientCount: countMap.get(String(d._id)) ?? 0 })),
        pagination: paginationMeta(total, page, limit),
    });
});

export const getDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).lean();
    if (!doctor) throw new AppError("Doctor not found", 404);

    const patientCount = await Patient.countDocuments({ doctor: doctor._id });
    res.json({ doctor: { ...doctor, patientCount } });
});

export const listDoctorPatients = asyncHandler(async (req, res) => {
    const { page, limit, search, condition, gender, from, to } =
        req.query as unknown as ListPatientsQuery;

    const doctorExists = await Doctor.exists({ _id: req.params.id });
    if (!doctorExists) throw new AppError("Doctor not found", 404);

    const filter: FilterQuery<IPatient> = { doctor: req.params.id };
    if (search) filter.$text = { $search: search };
    if (condition) filter.condition = condition;
    if (gender) filter.gender = gender;
    const range = dateRange(from, to);
    if (range) filter.visitDate = range;

    const [patients, total] = await Promise.all([
        Patient.find(filter)
            .sort({ visitDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Patient.countDocuments(filter),
    ]);

    res.json({ data: patients, pagination: paginationMeta(total, page, limit) });
});

export const addPatientToDoctor = asyncHandler(async (req, res) => {
    const doctorExists = await Doctor.exists({ _id: req.params.id });
    if (!doctorExists) throw new AppError("Doctor not found", 404);

    const patient = await Patient.create({ ...req.body, doctor: req.params.id });
    res.status(201).json({ patient });
});

// Values for the filter dropdowns on the Doctors page
export const getDoctorFilters = asyncHandler(async (_req, res) => {
    const [specializations, hospitals] = await Promise.all([
        Doctor.distinct("specialization"),
        Doctor.distinct("hospital"),
    ]);
    res.json({ specializations: specializations.sort(), hospitals: hospitals.sort() });
});