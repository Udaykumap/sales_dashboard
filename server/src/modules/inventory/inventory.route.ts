// src/modules/inventory/inventory.route.ts

import { Router } from 'express';
import {
  createInventory,
  getAllInventory,
  getInventoryByProductId,
  updateInventory,
  deleteInventory,
  adjustInventoryQuantity,
  getLowStockAlerts
} from './inventory.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

// All inventory routes require authentication
// GET operations are available to authenticated users
// POST/PUT/DELETE operations require ADMIN role

// Get all inventory items with optional filters
router.get('/', authenticate, getAllInventory);

// Get low stock alerts (items below reorder level)
router.get('/alerts/low-stock', authenticate, getLowStockAlerts);

// Get inventory by product ID
router.get('/:productId', authenticate, getInventoryByProductId);

// Create new inventory record (ADMIN only)
router.post('/', authenticate, requireRole(['ADMIN']), createInventory);

// Update inventory (ADMIN only)
router.put('/:productId', authenticate, requireRole(['ADMIN']), updateInventory);

// Adjust inventory quantity (ADMIN only - for manual adjustments)
router.patch('/:productId/adjust', authenticate, requireRole(['ADMIN']), adjustInventoryQuantity);

// Delete inventory record (ADMIN only)
router.delete('/:productId', authenticate, requireRole(['ADMIN']), deleteInventory);

export default router;