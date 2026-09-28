import mongoose from "mongoose";

const statusValues = ["requested", "accepted", "rejected", "cancelled", "completed"];

const rentalSchema = new mongoose.Schema({
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
  inventory: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true, index: true },
  quantity: { type: Number, required: true, min: 1 },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  rentalDays: { type: Number, required: true, min: 1 },
  pricePerDay: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: statusValues, default: "requested", index: true },
  renterNote: { type: String, trim: true, maxlength: 1000, default: "" },
  sellerNote: { type: String, trim: true, maxlength: 1000, default: "" },
  statusHistory: [{
    status: { type: String, enum: statusValues, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, trim: true, maxlength: 1000, default: "" },
    changedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

rentalSchema.index({ renter: 1, createdAt: -1 });
rentalSchema.index({ seller: 1, status: 1, createdAt: -1 });
rentalSchema.index({ inventory: 1, startAt: 1, endAt: 1 });

export default mongoose.model("Rental", rentalSchema);
