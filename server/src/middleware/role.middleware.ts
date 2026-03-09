// src/middleware/role.middleware.ts

import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

/**
 * returns a middleware which ensures the authenticated user
 * has one of the allowed roles. 401 if no token, 403 if role
 * is not permitted.
 */
export const requireRole =
  (allowed: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

// alias used by some routes
export const authorize = requireRole;