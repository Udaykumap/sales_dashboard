// src/modules/users/users.routes.ts

import { Router } from "express";
import { createUser, getAllUsers } from "./users.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate";
import { createUserSchema } from "./users.validation";


const router = Router();

// only admins can list users
router.get("/", authenticate, requireRole(["ADMIN"]), getAllUsers);

// only admins can create users with validation
router.post("/", authenticate, requireRole(["ADMIN"]), validate(createUserSchema), createUser as any);

export default router;
