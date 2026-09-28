import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  storeName: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 2000, default: "" },
  contactEmail: { type: String, trim: true, lowercase: true },
  contactPhone: { type: String, trim: true },
  address: {
    line1: { type: String, trim: true, maxlength: 200 },
    line2: { type: String, trim: true, maxlength: 200 },
    city: { type: String, trim: true, maxlength: 100 },
    state: { type: String, trim: true, maxlength: 100 },
    postalCode: { type: String, trim: true, maxlength: 20 },
    country: { type: String, trim: true, default: "India", maxlength: 100 }
  },
  status: { type: String, enum: ["active", "suspended"], default: "active", index: true }
}, { timestamps: true });

export default mongoose.model("Seller", sellerSchema);
