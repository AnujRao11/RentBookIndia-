import Inventory from "../models/Inventory.js";
import Order from "../models/Order.js";
import Rental from "../models/Rental.js";
import Seller from "../models/Seller.js";
import { asyncHandler, httpError } from "../utils/validation.js";
import { success } from "../utils/response.js";

async function getSellerProfile(userId) {
  const seller = await Seller.findOne({ user: userId });
  if (!seller) throw httpError("Seller profile not found", 403);
  return seller;
}

function pagination(query) {
  return {
    page: query.page,
    limit: query.limit,
    skip: (query.page - 1) * query.limit
  };
}

async function populateOrder(query) {
  return query
    .populate("customer", "name")
    .populate("seller", "storeName address.city")
    .populate("rental", "startAt endAt rentalDays status");
}

export const createOrder = asyncHandler(async (req, res) => {
  const { rentalId, deliveryAddress, deliveryInstructions = "" } = req.body;
  const existing = await Order.findOne({ rental: rentalId, customer: req.user._id });
  if (existing) return success(res, { order: existing, alreadyCreated: true });

  const rental = await Rental.findOne({ _id: rentalId, renter: req.user._id })
    .populate("book", "title authors coverImageUrl")
    .populate("seller", "storeName");
  if (!rental) throw httpError("Rental not found", 404);
  if (rental.status !== "accepted") throw httpError("Only accepted rentals can be ordered", 409);
  if (rental.startAt <= new Date()) throw httpError("The rental start time has passed", 409);

  const item = {
    book: rental.book._id,
    title: rental.book.title,
    authors: rental.book.authors,
    coverImageUrl: rental.book.coverImageUrl,
    quantity: rental.quantity,
    rentalDays: rental.rentalDays,
    pricePerDay: rental.pricePerDay,
    lineTotal: rental.totalPrice
  };
  const order = await Order.create({
    customer: req.user._id,
    seller: rental.seller._id,
    rental: rental._id,
    items: [item],
    deliveryAddress,
    deliveryInstructions,
    subtotal: rental.totalPrice,
    deliveryFee: 0,
    taxAmount: 0,
    totalAmount: rental.totalPrice,
    status: "pending_payment",
    paymentStatus: "pending",
    statusHistory: [{ status: "pending_payment", actor: req.user._id }]
  });
  return success(res, { order }, 201);
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { customer: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const [orders, total] = await Promise.all([
    populateOrder(Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Order.countDocuments(filter)
  ]);
  return success(res, { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const listSellerOrders = asyncHandler(async (req, res) => {
  const seller = await getSellerProfile(req.user._id);
  const { page, limit, skip } = pagination(req.query);
  const filter = { seller: seller._id };
  if (req.query.status) filter.status = req.query.status;
  const [orders, total] = await Promise.all([
    populateOrder(Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Order.countDocuments(filter)
  ]);
  return success(res, { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await populateOrder(Order.findById(req.params.id));
  if (!order) throw httpError("Order not found", 404);
  const isCustomer = String(order.customer._id) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  const seller = req.user.role === "seller" ? await Seller.findOne({ user: req.user._id }).select("_id") : null;
  const isSeller = seller && String(seller._id) === String(order.seller._id);
  if (!isCustomer && !isSeller && !isAdmin) throw httpError("Order not found", 404);
  return success(res, { order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, customer: req.user._id, status: "pending_payment", paymentStatus: "pending" },
    {
      $set: { status: "cancelled" },
      $push: { statusHistory: { status: "cancelled", actor: req.user._id, note: req.body.note || "" } }
    },
    { new: true }
  );
  if (!order) {
    const existing = await Order.findOne({ _id: req.params.id, customer: req.user._id }).select("status");
    if (!existing) throw httpError("Order not found", 404);
    throw httpError(`Order cannot be cancelled from status '${existing.status}'`, 409);
  }

  const cancelledRental = await Rental.findOneAndUpdate(
    { _id: order.rental, renter: req.user._id, status: "accepted" },
    {
      $set: { status: "cancelled" },
      $push: { statusHistory: { status: "cancelled", actor: req.user._id, note: req.body.note || "Order cancelled before payment" } }
    },
    { new: true }
  );
  if (cancelledRental) {
    await Inventory.updateOne({ _id: cancelledRental.inventory }, { $inc: { quantity: cancelledRental.quantity } });
  } else {
    const rental = await Rental.findOne({ _id: order.rental, renter: req.user._id }).select("status");
    if (rental && !["completed", "cancelled", "rejected"].includes(rental.status)) {
      throw httpError("Order was cancelled, but the rental state could not be updated", 409);
    }
  }

  await order.populate([
    { path: "seller", select: "storeName address.city" },
    { path: "rental", select: "startAt endAt rentalDays status" }
  ]);
  return success(res, { order });
});
