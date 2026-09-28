import { Router } from "express";
import {
  cancelOrder, createOrder, getOrderById, listMyOrders, listSellerOrders
} from "../controllers/order.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";
import {
  cancelOrderSchema, createOrderSchema, orderIdParamsSchema, orderListQuerySchema
} from "../validators/order.validators.js";

const router = Router();
router.use(requireAuth);

router.get("/me", requireRole("customer"), validate(orderListQuerySchema, "query"), listMyOrders);
router.get("/seller", requireRole("seller"), validate(orderListQuerySchema, "query"), listSellerOrders);
router.post("/", requireRole("customer"), validate(createOrderSchema), createOrder);
router.get("/:id", validate(orderIdParamsSchema, "params"), getOrderById);
router.patch("/:id/cancel", requireRole("customer"), validate(orderIdParamsSchema, "params"), validate(cancelOrderSchema), cancelOrder);

export default router;
