import { Router } from "express";
import { protect } from "../middleware/auth";
import authRoutes from "./auth.routes";
import dashboardRoutes from "./dashboard.routes";
import doctorRoutes from "./doctor.routes";
import patientRoutes from "./patient.routes";

const router = Router();

router.use("/auth", authRoutes); // login is public, /me protects itself
router.use("/doctors", protect, doctorRoutes);
router.use("/patients", protect, patientRoutes);
router.use("/dashboard", protect, dashboardRoutes);

export default router;