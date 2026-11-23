import bcrypt from "bcryptjs";
import { User } from "../models";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // password is hidden by default (select: false), so ask for it explicitly
    const user = await User.findOne({ email }).select("+password");
    const passwordOk = user ? await bcrypt.compare(password, user.password) : false;

    // Same message for "no such user" and "wrong password", so attackers can't tell which emails exist
    if (!user || !passwordOk) {
        throw new AppError("Invalid email or password", 401);
    }

    res.json({
        token: signToken(user.id),
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
});

export const me = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) throw new AppError("User not found", 404);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});