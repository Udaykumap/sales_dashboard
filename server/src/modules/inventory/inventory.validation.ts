// src/modules/inventory/inventory.validation.ts

import { z } from "zod";

export const createInventorySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
  reorderLevel: z.number().int().min(0, "Reorder level must be non-negative"),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0, "Quantity must be non-negative").optional(),
  reorderLevel: z.number().int().min(0, "Reorder level must be non-negative").optional(),
});

export const adjustQuantitySchema = z.object({
  adjustment: z.number().int("Adjustment must be an integer"),
});