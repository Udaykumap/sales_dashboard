import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "./category.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();

// router.post("/", createCategory);
// router.get("/", getCategories);
// router.get("/:id", getCategoryById);
// router.put("/:id", updateCategory);
// router.delete("/:id", deleteCategory);
router.get("/", authenticate, getCategories as any);
router.get("/:id", authenticate, getCategoryById);
router.post("/", authenticate, authorize(["ADMIN"]), createCategory);
router.put("/:id", authenticate, authorize(["ADMIN"]), updateCategory);
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteCategory);

export default router;
