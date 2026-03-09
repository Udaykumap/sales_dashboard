import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "./products.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from '../../middleware/role.middleware';


 
const router = Router();
 
// router.post("/", createProduct);
// router.get("/",getProducts);
// router.get("/:id", getProductById);
// router.put("/:id",  updateProduct);
// router.delete("/:id", deleteProduct);
router.get("/", authenticate, getProducts as any);
router.get("/:id", authenticate, getProductById);
router.post("/", authenticate, authorize(["ADMIN"]), createProduct);
router.put("/:id", authenticate, authorize(["ADMIN"]), updateProduct);
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteProduct);
 
export default router;