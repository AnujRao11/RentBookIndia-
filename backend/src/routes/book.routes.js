import { Router } from "express";
import { getBookById, getBookCategories, listBooks } from "../controllers/book.controller.js";
import { validate } from "../utils/validation.js";
import { bookIdParamsSchema, bookListQuerySchema } from "../validators/marketplace.validators.js";

const router = Router();
router.get("/categories", getBookCategories);
router.get("/", validate(bookListQuerySchema, "query"), listBooks);
router.get("/:id", validate(bookIdParamsSchema, "params"), getBookById);
export default router;
