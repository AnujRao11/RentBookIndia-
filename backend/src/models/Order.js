import mongoose from "mongoose";
import { randomBytes } from "node:crypto";

const orderStatuses = [
  "pending_payment", "paid", "processing", "ready_for_dispatch",
  "in_transit", "delivered", "cancelled", "refunded"
];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];

const deliveryAddressSchema = new mongoose.Schema({
  recipientName: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 20 },
  line1: { type: String, required: true, trim: true, maxlength: 200 },
  line2: { type: String, trim: true, maxlength: 200, default: "" },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  postalCode: { type: String, required: true, trim: true, maxlength: 20 },
  country: { type: String, required: true, trim: true, maxlength: 100, default: "India" }
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  title: { type: String, required: true, trim: true, maxlength: 240 },
  authors: { type: [String], default: [] },
  coverImageUrl: { type: String, trim: true, maxlength: 2048, default: "" },
  quantity: { type: Number, required: true, min: 1 },
  rentalDays: { type: Number, required: true, min: 1 },
  pricePerDay: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => `RB-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`
  },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
  rental: { type: mongoose.Schema.Types.ObjectId, ref: "Rental", required: true, unique: true, index: true },
  items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, "Order requires at least one item"] },
  deliveryAddress: { type: deliveryAddressSchema, required: true },
  deliveryInstructions: { type: String, trim: true, maxlength: 1000, default: "" },
  subtotal: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, min: 0, default: 0 },
  taxAmount: { type: Number, min: 0, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ["INR"], default: "INR" },
  status: { type: String, enum: orderStatuses, default: "pending_payment", index: true },
  paymentStatus: { type: String, enum: paymentStatuses, default: "pending", index: true },
  statusHistory: [{
    status: { type: String, enum: orderStatuses, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, trim: true, maxlength: 1000, default: "" },
    changedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
