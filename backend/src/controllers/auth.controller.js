import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";
import { ROLES } from "../constants/roles.js";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z.string().min(8).max(72),
  accountType: z.enum(["student", "bookstore", "delivery_partner", "admin"]).optional()
}).strict();

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72)
}).strict();

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    accountType: user.accountType
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid registration details", errors: parsed.error.issues.map((issue) => issue.message) });
    }
    const { name, email, mobile, password } = parsed.data;
    // Public sign-up always creates the least-privileged role.
    const accountType = "student";

    const normalizedEmail = normalizeEmail(email);
    const normalizedMobile = String(mobile).trim();
    const exists = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }] });
    if (exists) return res.status(409).json({ success: false, message: "Email or mobile is already registered" });

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      mobile: normalizedMobile,
      passwordHash,
      role: ROLES.CUSTOMER,
      accountType
    });

    const accessToken = signAccessToken(user);
    return res.status(201).json({ success: true, user: publicUser(user), accessToken });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "A valid email and password are required" });
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email: normalizeEmail(email) }).select("+passwordHash");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const accessToken = signAccessToken(user);
    return res.json({ success: true, user: publicUser(user), accessToken });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  return res.json({ success: true, user: publicUser(req.user) });
}
