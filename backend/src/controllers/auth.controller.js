import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";
import { ROLES } from "../constants/roles.js";

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
    const { name, email, mobile, password, role = ROLES.CUSTOMER, accountType = "student" } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ success: false, message: "name, email, mobile and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must contain at least 8 characters" });
    }
    if (role !== ROLES.CUSTOMER) {
      return res.status(403).json({ success: false, message: "Public registration can only create customer accounts" });
    }

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
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

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
