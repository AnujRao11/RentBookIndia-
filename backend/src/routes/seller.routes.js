import { Router } from "express";
import { createSellerProfile, getMySellerProfile, getSellerById, updateSellerProfile } from "../controllers/seller.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";
import { sellerCreateSchema, sellerUpdateSchema } from "../validators/marketplace.validators.js";

const router = Router();
router.get("/me", requireAuth, requireRole("seller"), getMySellerProfile);
router.post("/me", requireAuth, requireRole("seller"), validate(sellerCreateSchema), createSellerProfile);
router.patch("/me", requireAuth, requireRole("seller"), validate(sellerUpdateSchema), updateSellerProfile);
router.get("/:id", getSellerById);
export default router;
