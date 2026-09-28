import mongoose from "mongoose";
import Book from "../models/Book.js";
import Inventory from "../models/Inventory.js";
import Seller from "../models/Seller.js";
import { asyncHandler, httpError } from "../utils/validation.js";
import { success } from "../utils/response.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const listBooks = asyncHandler(async (req, res) => {
  const { q, category, author, language, city, condition, minRent, maxRent, page, limit, sort } = req.query;
  const bookMatch = { isActive: true };
  if (category) bookMatch.category = new RegExp(`^${escapeRegex(category)}$`, "i");
  if (language) bookMatch.language = new RegExp(`^${escapeRegex(language)}$`, "i");
  if (author) bookMatch.authors = new RegExp(escapeRegex(author), "i");
  if (q) {
    const term = new RegExp(escapeRegex(q), "i");
    bookMatch.$or = [{ title: term }, { authors: term }, { isbn: term }, { description: term }];
  }
  const books = await Book.find(bookMatch).sort(sort === "title" ? { title: 1 } : { createdAt: -1 }).lean();
  const bookIds = books.map(({ _id }) => _id);
  const sellerQuery = { status: "active" };
  if (city) sellerQuery["address.city"] = new RegExp(`^${escapeRegex(city)}$`, "i");
  const sellers = await Seller.find(sellerQuery).distinct("_id");
  const inventoryQuery = { book: { $in: bookIds }, seller: { $in: sellers }, isAvailable: true, quantity: { $gt: 0 } };
  if (condition) inventoryQuery.condition = condition;
  if (minRent !== undefined || maxRent !== undefined) {
    inventoryQuery.rentPricePerDay = {};
    if (minRent !== undefined) inventoryQuery.rentPricePerDay.$gte = minRent;
    if (maxRent !== undefined) inventoryQuery.rentPricePerDay.$lte = maxRent;
  }
  const inventory = await Inventory.find(inventoryQuery).populate("seller", "storeName address.city").lean();
  const byBook = new Map();
  for (const item of inventory) {
    const key = String(item.book);
    if (!byBook.has(key)) byBook.set(key, []);
    byBook.get(key).push(item);
  }
  let results = books.filter((book) => byBook.has(String(book._id))).map((book) => ({
    ...book, offers: byBook.get(String(book._id))
  }));
  if (sort === "rent-low" || sort === "rent-high") {
    results.sort((a, b) => {
      const delta = Math.min(...a.offers.map((o) => o.rentPricePerDay)) - Math.min(...b.offers.map((o) => o.rentPricePerDay));
      return sort === "rent-low" ? delta : -delta;
    });
  } else if (sort === "newest") results.sort((a, b) => b.createdAt - a.createdAt);
  const total = results.length;
  results = results.slice((page - 1) * limit, page * limit);
  return success(res, { books: results, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getBookCategories = asyncHandler(async (req, res) => {
  const categories = await Book.distinct("category", { isActive: true });
  return success(res, { categories: categories.sort((a, b) => a.localeCompare(b)) });
});

export const getBookById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError("Book not found", 404);
  const book = await Book.findOne({ _id: req.params.id, isActive: true }).lean();
  if (!book) throw httpError("Book not found", 404);
  const sellers = await Seller.find({ status: "active" }).distinct("_id");
  const offers = await Inventory.find({ book: book._id, seller: { $in: sellers }, isAvailable: true, quantity: { $gt: 0 } })
    .populate("seller", "storeName address.city").lean();
  return success(res, { book: { ...book, offers } });
});
