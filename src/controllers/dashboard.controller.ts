import { Doctor, Patient } from "../models";
import type { DashboardQuery } from "../validators/dashboard.validator";
import { asyncHandler } from "../utils/asyncHandler";

// Days are grouped in Bangladesh time, so a visit at 11pm doesn't land on the wrong day.
// (Bangladesh has no daylight saving, so a fixed +06:00 offset is safe.)
const TZ = "Asia/Dhaka";
const TZ_OFFSET = "+06:00";
const DAY_MS = 24 * 60 * 60 * 1000;

const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD

export const getDashboard = asyncHandler(async (req, res) => {
    const { days } = req.query as unknown as DashboardQuery;

    // Every day in the range, oldest first, so days with zero patients still appear on the chart
    const now = new Date();
    const dayKeys = Array.from({ length: days }, (_, i) =>
        dayKey(new Date(now.getTime() - (days - 1 - i) * DAY_MS))
    );
    const since = new Date(`${dayKeys[0]}T00:00:00${TZ_OFFSET}`);

    const [
        totalDoctors,
        totalPatients,
        patientsInRange,
        newDoctorsInRange,
        patientsPerDoctor,
        dailyCounts,
        conditions,
        gender,
        specializations,
    ] = await Promise.all([
        Doctor.estimatedDocumentCount(),
        Patient.estimatedDocumentCount(),
        Patient.countDocuments({ visitDate: { $gte: since } }),
        Doctor.countDocuments({ createdAt: { $gte: since } }),

        // Top 10 doctors by patient count. Sort and limit BEFORE the lookup,
        // so the join only runs for 10 doctors instead of all of them.
        Patient.aggregate([
            { $group: { _id: "$doctor", patients: { $sum: 1 } } },
            { $sort: { patients: -1 } },
            { $limit: 10 },
            { $lookup: { from: "doctors", localField: "_id", foreignField: "_id", as: "doctor" } },
            { $unwind: "$doctor" },
            {
                $project: {
                    _id: 0,
                    doctorId: "$_id",
                    name: "$doctor.name",
                    specialization: "$doctor.specialization",
                    patients: 1,
                },
            },
        ]),

        // Patients per day in the range (uses the visitDate index for the $match)
        Patient.aggregate<{ date: string; count: number }>([
            { $match: { visitDate: { $gte: since } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitDate", timezone: TZ } },
                    count: { $sum: 1 },
                },
            },
            { $project: { _id: 0, date: "$_id", count: 1 } },
        ]),

        // Most common conditions
        Patient.aggregate([
            { $group: { _id: "$condition", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
            { $project: { _id: 0, condition: "$_id", count: 1 } },
        ]),

        // Gender split
        Patient.aggregate([
            { $group: { _id: "$gender", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, gender: "$_id", count: 1 } },
        ]),

        // Doctors per specialization
        Doctor.aggregate([
            { $group: { _id: "$specialization", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, specialization: "$_id", count: 1 } },
        ]),
    ]);

    const countByDay = new Map(dailyCounts.map((r) => [r.date, r.count]));
    const patientsOverTime = dayKeys.map((date) => ({ date, count: countByDay.get(date) ?? 0 }));

    res.json({
        range: { days, from: dayKeys[0], to: dayKeys[dayKeys.length - 1] },
        totals: { doctors: totalDoctors, patients: totalPatients, patientsInRange, newDoctorsInRange },
        patientsPerDoctor,
        patientsOverTime,
        conditions,
        gender,
        specializations,
    });
});