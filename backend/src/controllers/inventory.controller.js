import Book from "../models/Book.js";
import Inventory from "../models/Inventory.js";
import Seller from "../models/Seller.js";
import { asyncHandler, httpError } from "../utils/validation.js";
import { success } from "../utils/response.js";

async function activeSeller(userId) {
  const seller = await Seller.findOne({ user: userId, status: "active" });
  if (!seller) throw httpError("Active seller profile required", 403);
  return seller;
}

export const listMyInventory = asyncHandler(async (req, res) => {
  const seller = await activeSeller(req.user._id);
  const inventory = await Inventory.find({ seller: seller._id }).populate("book").sort({ updatedAt: -1 });
  return success(res, { inventory });
});

export const createInventory = asyncHandler(async (req, res) => {
  const seller = await activeSeller(req.user._id);
  let book;
  if (req.body.book) {
    book = await Book.create(req.body.book);
  } else {
    book = await Book.findOne({ _id: req.body.bookId, isActive: true });
    if (!book) throw httpError("Book not found", 404);
  }
  const { condition, quantity, rentPricePerDay, salePrice, isAvailable, notes } = req.body;
  const inventory = await Inventory.create({
    seller: seller._id, book: book._id, condition, quantity, rentPricePerDay, salePrice, isAvailable, notes
  });
  await inventory.populate(["book", { path: "seller", select: "storeName" }]);
  return success(res, { inventory }, 201);
});

export const updateInventory = asyncHandler(async (req, res) => {
  const seller = await activeSeller(req.user._id);
  const inventory = await Inventory.findOneAndUpdate(
    { _id: req.params.id, seller: seller._id }, { $set: req.body },
    { new: true, runValidators: true }
  ).populate("book");
  if (!inventory) throw httpError("Inventory item not found", 404);
  return success(res, { inventory });
});

export const deleteInventory = asyncHandler(async (req, res) => {
  const seller = await activeSeller(req.user._id);
  const inventory = await Inventory.findOneAndDelete({ _id: req.params.id, seller: seller._id });
  if (!inventory) throw httpError("Inventory item not found", 404);
  return success(res, { message: "Inventory item deleted" });
});
