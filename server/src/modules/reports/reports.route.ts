import { Router } from 'express'
import {
  getSalesReport,
  getInventoryReport
} from './reports.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { requireRole } from '../../middleware/role.middleware'

const router = Router()

router.get('/sales', authenticate, requireRole(['ADMIN']), getSalesReport)
router.get('/inventory', authenticate, requireRole(['ADMIN']), getInventoryReport)

export default router