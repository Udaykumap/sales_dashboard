import { Router } from 'express';
import customerController from './customers.controller';
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";


const router = Router();

// Public: list and get
router.get('/', authenticate, customerController.list.bind(customerController));
router.get('/:id', authenticate, customerController.getById.bind(customerController));

// Create
router.post('/', authenticate, requireRole(["ADMIN", "SALES"]), customerController.create.bind(customerController));

// Update/Delete
router.put('/:id', authenticate, requireRole(["ADMIN", "SALES"]), customerController.update.bind(customerController));
router.delete('/:id', authenticate, requireRole(["ADMIN", "SALES"]), customerController.delete.bind(customerController));

export default router;
