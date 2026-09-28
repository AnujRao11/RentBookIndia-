import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signAccessToken } from "../utils/jwt.js";

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

export async function register(req, res, next) {
  try {
    const { name, email, mobile, password, role = "customer", accountType = "student" } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "name, email, mobile and password are required" });
    }
    if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters" });

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile }] });
    if (exists) return res.status(409).json({ message: "Email or mobile is already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: normalizedEmail, mobile, passwordHash, role, accountType });
    const token = signAccessToken(user);
    return res.status(201).json({ user: publicUser(user), accessToken: token });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
    if (!user || !user.isActive) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = signAccessToken(user);
    return res.json({ user: publicUser(user), accessToken: token });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  return res.json({ user: publicUser(req.user) });
}
