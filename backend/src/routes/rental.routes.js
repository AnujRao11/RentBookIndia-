import { Router } from "express";
import {
  cancelRental, completeRental, createRental, decideRental,
  getRentalById, listMyRentals, listSellerRentals
} from "../controllers/rental.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";
import {
  createRentalSchema, rentalCancelSchema, rentalDecisionSchema,
  rentalIdParamsSchema, rentalListQuerySchema
} from "../validators/rental.validators.js";

const router = Router();
router.use(requireAuth);

router.get("/me", requireRole("customer"), validate(rentalListQuerySchema, "query"), listMyRentals);
router.get("/seller", requireRole("seller"), validate(rentalListQuerySchema, "query"), listSellerRentals);
router.post("/", requireRole("customer"), validate(createRentalSchema), createRental);
router.get("/:id", validate(rentalIdParamsSchema, "params"), getRentalById);
router.patch("/:id/cancel", requireRole("customer"), validate(rentalIdParamsSchema, "params"), validate(rentalCancelSchema), cancelRental);
router.patch("/:id/decision", requireRole("seller"), validate(rentalIdParamsSchema, "params"), validate(rentalDecisionSchema), decideRental);
router.patch("/:id/complete", requireRole("seller"), validate(rentalIdParamsSchema, "params"), completeRental);

export default router;
