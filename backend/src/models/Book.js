import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 240 },
  authors: { type: [String], required: true, validate: [(values) => values.length > 0 && values.length <= 20, "Provide between 1 and 20 authors"] },
  description: { type: String, trim: true, maxlength: 5000, default: "" },
  isbn: { type: String, trim: true, uppercase: true, sparse: true, unique: true, maxlength: 20 },
  category: { type: String, required: true, trim: true, lowercase: true, maxlength: 80, index: true },
  language: { type: String, trim: true, default: "English", maxlength: 60, index: true },
  publisher: { type: String, trim: true, maxlength: 160, default: "" },
  publishedYear: { type: Number, min: 1000, max: new Date().getFullYear() + 1 },
  pageCount: { type: Number, min: 1 },
  coverImageUrl: { type: String, trim: true, maxlength: 2048, default: "" },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

bookSchema.index({ title: "text", authors: "text", description: "text", category: "text" });
bookSchema.index({ category: 1, title: 1 });

export default mongoose.model("Book", bookSchema);
