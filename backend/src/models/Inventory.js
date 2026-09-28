import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true, index: true },
  condition: { type: String, enum: ["new", "like-new", "good", "acceptable"], default: "good" },
  quantity: { type: Number, required: true, min: 0, max: 100000 },
  rentPricePerDay: { type: Number, min: 0, default: 0 },
  salePrice: { type: Number, min: 0, default: 0 },
  isAvailable: { type: Boolean, default: true, index: true },
  notes: { type: String, trim: true, maxlength: 1000, default: "" }
}, { timestamps: true });

inventorySchema.index({ seller: 1, book: 1, condition: 1 }, { unique: true });
inventorySchema.index({ isAvailable: 1, quantity: 1, book: 1 });

export default mongoose.model("Inventory", inventorySchema);
