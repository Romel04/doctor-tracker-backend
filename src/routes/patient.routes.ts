import { Router } from "express";
import {
    deletePatient,
    getPatient,
    listConditions,
    listPatients,
    updatePatient,
} from "../controllers/patient.controller";
import { validate } from "../middleware/validate";
import { listPatientsQuerySchema, updatePatientSchema } from "../validators/patient.validator";

const router = Router();

router.get("/", validate(listPatientsQuerySchema, "query"), listPatients);
router.get("/conditions", listConditions); // before /:id on purpose

router
    .route("/:id")
    .get(getPatient)
    .patch(validate(updatePatientSchema), updatePatient)
    .delete(deletePatient);

export default router;