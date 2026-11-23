import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/auth", authRoutes);
// doctors, patients and dashboard routes will be added here later

export default router;