import { Router } from "express";
import {
    addPatientToDoctor,
    createDoctor,
    getDoctor,
    listDoctorPatients,
    listDoctors,
} from "../controllers/doctor.controller";
import { validate } from "../middleware/validate";
import { createDoctorSchema, listDoctorsQuerySchema } from "../validators/doctor.validator";
import { createPatientSchema, listPatientsQuerySchema } from "../validators/patient.validator";

const router = Router();

router
    .route("/")
    .get(validate(listDoctorsQuerySchema, "query"), listDoctors)
    .post(validate(createDoctorSchema), createDoctor);

router.get("/:id", getDoctor);

router
    .route("/:id/patients")
    .get(validate(listPatientsQuerySchema, "query"), listDoctorPatients)
    .post(validate(createPatientSchema), addPatientToDoctor);

export default router;