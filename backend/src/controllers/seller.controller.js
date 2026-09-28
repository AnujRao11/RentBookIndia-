import Seller from "../models/Seller.js";
import { asyncHandler, httpError } from "../utils/validation.js";
import { success } from "../utils/response.js";

export const getMySellerProfile = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ user: req.user._id }).populate("user", "name email mobile");
  return success(res, { seller });
});

export const createSellerProfile = asyncHandler(async (req, res) => {
  const existing = await Seller.findOne({ user: req.user._id });
  if (existing) throw httpError("Seller profile already exists", 409);
  const seller = await Seller.create({ ...req.body, user: req.user._id });
  return success(res, { seller }, 201);
});

export const updateSellerProfile = asyncHandler(async (req, res) => {
  const seller = await Seller.findOneAndUpdate(
    { user: req.user._id, status: "active" }, { $set: req.body },
    { new: true, runValidators: true }
  ).populate("user", "name email mobile");
  if (!seller) throw httpError("Active seller profile not found", 404);
  return success(res, { seller });
});

export const getSellerById = asyncHandler(async (req, res) => {
  const seller = await Seller.findOne({ _id: req.params.id, status: "active" }).select("storeName description address createdAt");
  if (!seller) throw httpError("Seller not found", 404);
  return success(res, { seller });
});
