import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller";
import { validate } from "../middleware/validate";
import { dashboardQuerySchema } from "../validators/dashboard.validator";

const router = Router();

router.get("/", validate(dashboardQuerySchema, "query"), getDashboard);

export default router;