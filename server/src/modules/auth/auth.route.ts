import { Router } from "express";
import {
  login,
  me,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  deleteUser,
  changePassword,
} from "./auth.controller";

import { validate } from "../../middleware/validate";
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  userIdParamSchema,
} from "./auth.validate";

import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.patch("/profile", authenticate, validate(updateProfileSchema), updateProfile);
router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);

router.delete(
  "/users/:userId",
  authenticate,
  requireRole(["ADMIN"]),
  validate(userIdParamSchema),
  deleteUser
);

router.get("/me", authenticate, me);

export default router;
