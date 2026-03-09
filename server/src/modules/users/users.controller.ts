import { Response } from "express";
import jwt from "jsonwebtoken";
import * as usersService from "./users.service";
import { createUserSchema } from "./users.validation";
import { AuthRequest } from "../../middleware/auth.middleware";



export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await usersService.fetchAllUsers();
    res.json({ message: "Users fetched successfully", users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await usersService.createUser(validatedData);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET! || "secret",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error: any) {
    console.error("Create user error:", error);
    res.status(400).json({
      message: "Error creating user",
      error: error.message || error,
    });
  }
};