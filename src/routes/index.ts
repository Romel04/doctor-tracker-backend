import { Router } from "express";
import { protect } from "../middleware/auth";
import authRoutes from "./auth.routes";
import doctorRoutes from "./doctor.routes";

const router = Router();

router.use("/auth", authRoutes); // login is public, /me protects itself
router.use("/doctors", protect, doctorRoutes);
// patients and dashboard routes will be added here later

export default router;