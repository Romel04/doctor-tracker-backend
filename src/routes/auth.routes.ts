import { Router } from "express";
import { login, me } from "../controllers/auth.controller";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { loginSchema } from "../validators/auth.validator";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/me", protect, me);

export default router;