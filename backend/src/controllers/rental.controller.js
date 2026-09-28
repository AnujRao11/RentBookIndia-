import Book from "../models/Book.js";
import Inventory from "../models/Inventory.js";
import Rental from "../models/Rental.js";
import Seller from "../models/Seller.js";
import { asyncHandler, httpError } from "../utils/validation.js";
import { success } from "../utils/response.js";

const dayMs = 24 * 60 * 60 * 1000;

async function getActiveSeller(userId) {
  const seller = await Seller.findOne({ user: userId, status: "active" });
  if (!seller) throw httpError("Active seller profile required", 403);
  return seller;
}

function listOptions(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  return {
    filter,
    skip: (query.page - 1) * query.limit,
    limit: query.limit,
    page: query.page
  };
}

async function loadRental(id) {
  return Rental.findById(id)
    .populate("book", "title authors coverImageUrl isbn")
    .populate("seller", "storeName address.city")
    .populate("renter", "name");
}

export const createRental = asyncHandler(async (req, res) => {
  const { inventoryId, quantity, startAt, endAt, renterNote = "" } = req.body;
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (start.getTime() <= Date.now()) throw httpError("startAt must be in the future");
  const periodMs = end.getTime() - start.getTime();
  if (periodMs < 60 * 60 * 1000 || periodMs > 365 * dayMs) {
    throw httpError("Rental period must be between one hour and 365 days");
  }
  const rentalDays = Math.ceil(periodMs / dayMs);

  const snapshot = await Inventory.findOne({ _id: inventoryId, isAvailable: true }).lean();
  if (!snapshot) throw httpError("Available inventory listing not found", 404);
  if (!(snapshot.rentPricePerDay > 0)) throw httpError("This listing is not available for rental", 400);

  const seller = await Seller.findOne({ _id: snapshot.seller, status: "active" });
  if (!seller) throw httpError("Seller is not active", 404);
  if (String(seller.user) === String(req.user._id)) throw httpError("You cannot rent your own listing", 400);
  const book = await Book.findOne({ _id: snapshot.book, isActive: true });
  if (!book) throw httpError("Book is not available", 404);

  const reserved = await Inventory.findOneAndUpdate(
    {
      _id: snapshot._id,
      seller: seller._id,
      book: book._id,
      isAvailable: true,
      quantity: { $gte: quantity },
      rentPricePerDay: snapshot.rentPricePerDay
    },
    { $inc: { quantity: -quantity } },
    { new: true }
  );
  if (!reserved) throw httpError("Requested quantity is no longer available", 409);

  const totalPrice = Math.round(snapshot.rentPricePerDay * rentalDays * quantity * 100) / 100;
  try {
    const rental = await Rental.create({
      renter: req.user._id,
      seller: seller._id,
      inventory: snapshot._id,
      book: book._id,
      quantity,
      startAt: start,
      endAt: end,
      rentalDays,
      pricePerDay: snapshot.rentPricePerDay,
      totalPrice,
      renterNote,
      statusHistory: [{ status: "requested", actor: req.user._id, note: renterNote }]
    });
    await rental.populate([
      { path: "book", select: "title authors coverImageUrl isbn" },
      { path: "seller", select: "storeName address.city" },
      { path: "renter", select: "name" }
    ]);
    return success(res, { rental }, 201);
  } catch (error) {
    try {
      await Inventory.updateOne({ _id: snapshot._id }, { $inc: { quantity } });
    } catch (restoreError) {
      console.error("Could not restore inventory after rental creation failed", restoreError);
    }
    throw error;
  }
});

export const listMyRentals = asyncHandler(async (req, res) => {
  const { filter, skip, limit, page } = listOptions(req.query);
  filter.renter = req.user._id;
  const [rentals, total] = await Promise.all([
    Rental.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate("book", "title authors coverImageUrl")
      .populate("seller", "storeName address.city"),
    Rental.countDocuments(filter)
  ]);
  return success(res, { rentals, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const listSellerRentals = asyncHandler(async (req, res) => {
  const seller = await getActiveSeller(req.user._id);
  const { filter, skip, limit, page } = listOptions(req.query);
  filter.seller = seller._id;
  const [rentals, total] = await Promise.all([
    Rental.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate("book", "title authors coverImageUrl")
      .populate("renter", "name"),
    Rental.countDocuments(filter)
  ]);
  return success(res, { rentals, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getRentalById = asyncHandler(async (req, res) => {
  const rental = await loadRental(req.params.id);
  if (!rental) throw httpError("Rental not found", 404);
  const isRenter = String(rental.renter._id) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  const seller = req.user.role === "seller" ? await Seller.findOne({ user: req.user._id }).select("_id") : null;
  const isSeller = seller && String(seller._id) === String(rental.seller._id);
  if (!isRenter && !isSeller && !isAdmin) throw httpError("Rental not found", 404);
  return success(res, { rental });
});

export const cancelRental = asyncHandler(async (req, res) => {
  const updated = await Rental.findOneAndUpdate(
    { _id: req.params.id, renter: req.user._id, status: { $in: ["requested", "accepted"] }, startAt: { $gt: new Date() } },
    {
      $set: { status: "cancelled" },
      $push: { statusHistory: { status: "cancelled", actor: req.user._id, note: req.body.note || "" } }
    },
    { new: true }
  );
  if (!updated) {
    const existing = await Rental.findOne({ _id: req.params.id, renter: req.user._id }).select("status");
    if (!existing) throw httpError("Rental not found", 404);
    throw httpError(`Rental cannot be cancelled from status '${existing.status}'`, 409);
  }
  await Inventory.updateOne({ _id: updated.inventory }, { $inc: { quantity: updated.quantity } });
  await updated.populate([
    { path: "book", select: "title authors coverImageUrl" },
    { path: "seller", select: "storeName address.city" }
  ]);
  return success(res, { rental: updated });
});

export const decideRental = asyncHandler(async (req, res) => {
  const seller = await getActiveSeller(req.user._id);
  const status = req.body.decision === "accept" ? "accepted" : "rejected";
  const updated = await Rental.findOneAndUpdate(
    { _id: req.params.id, seller: seller._id, status: "requested" },
    {
      $set: { status, sellerNote: req.body.note || "" },
      $push: { statusHistory: { status, actor: req.user._id, note: req.body.note || "" } }
    },
    { new: true }
  );
  if (!updated) {
    const existing = await Rental.findOne({ _id: req.params.id, seller: seller._id }).select("status");
    if (!existing) throw httpError("Rental not found", 404);
    throw httpError(`Rental cannot be decided from status '${existing.status}'`, 409);
  }
  if (status === "rejected") {
    await Inventory.updateOne({ _id: updated.inventory }, { $inc: { quantity: updated.quantity } });
  }
  await updated.populate([
    { path: "book", select: "title authors coverImageUrl" },
    { path: "renter", select: "name" }
  ]);
  return success(res, { rental: updated });
});

export const completeRental = asyncHandler(async (req, res) => {
  const seller = await getActiveSeller(req.user._id);
  const updated = await Rental.findOneAndUpdate(
    { _id: req.params.id, seller: seller._id, status: "accepted" },
    {
      $set: { status: "completed" },
      $push: { statusHistory: { status: "completed", actor: req.user._id } }
    },
    { new: true }
  );
  if (!updated) {
    const existing = await Rental.findOne({ _id: req.params.id, seller: seller._id }).select("status");
    if (!existing) throw httpError("Rental not found", 404);
    throw httpError(`Rental cannot be completed from status '${existing.status}'`, 409);
  }
  await Inventory.updateOne({ _id: updated.inventory }, { $inc: { quantity: updated.quantity } });
  await updated.populate([
    { path: "book", select: "title authors coverImageUrl" },
    { path: "renter", select: "name" }
  ]);
  return success(res, { rental: updated });
});
