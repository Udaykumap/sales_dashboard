// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// export interface AuthRequest extends Request {
//   user?: { id: string; email: string; role: string };
// }

// export const authenticateToken = (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "Access token required" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     req.user = decoded as any;
//     next();
//   } catch (error) {
//     res.status(403).json({ message: "Invalid or expired token" });
//   }
// };