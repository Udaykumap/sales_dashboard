import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as authService from "./auth.service";

export const login = async (req: Request, res: Response) => {
  try {
    const data = await authService.loginUser(req.body);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const data = await authService.refreshAccessToken(req.body);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = async (_req: Request, res: Response) => {
  const data = await authService.logoutUser();
  res.json(data);
};

export const me = async (req: AuthRequest, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  res.json(user);
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const data = await authService.forgotPassword(req.body);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const data = await authService.resetPassword(req.body);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const data = await authService.changePassword(req.user!.id, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const data = await authService.updateProfile(req.user!.id, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const data = await authService.deleteUser(userId);
    if (!data) return res.status(404).json({ message: "User not found" });
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
