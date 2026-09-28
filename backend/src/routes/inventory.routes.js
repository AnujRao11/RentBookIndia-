import { Router } from "express";
import { createInventory, deleteInventory, listMyInventory, updateInventory } from "../controllers/inventory.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../utils/validation.js";
import { inventoryCreateSchema, inventoryParamsSchema, inventoryUpdateSchema } from "../validators/marketplace.validators.js";

const router = Router();
router.use(requireAuth, requireRole("seller"));
router.get("/", listMyInventory);
router.post("/", validate(inventoryCreateSchema), createInventory);
router.patch("/:id", validate(inventoryParamsSchema, "params"), validate(inventoryUpdateSchema), updateInventory);
router.delete("/:id", validate(inventoryParamsSchema, "params"), deleteInventory);
export default router;
