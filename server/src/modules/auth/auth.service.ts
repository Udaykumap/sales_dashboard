import { prisma } from "../../config/adapter";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "./auth.validate";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || "reset_secret";

const signAccessToken = (payload: { id: string; role: string }) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

const signRefreshToken = (payload: { id: string; role: string }) =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });

export const registerUser = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });

  return { user, token, refreshToken };
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const { password, ...safeUser } = user;

  const token = signAccessToken({ id: safeUser.id, role: safeUser.role });
  const refreshToken = signRefreshToken({ id: safeUser.id, role: safeUser.role });

  return { user: safeUser, token, refreshToken };
};

export const refreshAccessToken = async (data: RefreshTokenInput) => {
  try {
    const decoded = jwt.verify(data.refreshToken, JWT_REFRESH_SECRET) as {
      id: string;
      role: string;
    };

    const token = signAccessToken({ id: decoded.id, role: decoded.role });
    const refreshToken = signRefreshToken({ id: decoded.id, role: decoded.role });

    return { token, refreshToken };
  } catch {
    throw new Error("Invalid refresh token");
  }
};

export const getCurrentUser = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const forgotPassword = async (data: ForgotPasswordInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    return { success: true };
  }

  const resetToken = jwt.sign(
    { id: user.id },
    JWT_RESET_SECRET,
    { expiresIn: "15m" }
  );

  return { success: true, resetToken };
};

export const resetPassword = async (data: ResetPasswordInput) => {
  try {
    const decoded = jwt.verify(data.resetToken, JWT_RESET_SECRET) as { id: string };

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch {
    throw new Error("Invalid or expired reset token");
  }
};

export const changePassword = async (userId: string, data: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(data.currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true };
};

export const updateProfile = async (userId: string, data: UpdateProfileInput) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const deleteUser = async (userId: string) => {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return null;

  return prisma.user.delete({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};

export const logoutUser = async () => {
  return { success: true };
};
