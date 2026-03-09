import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(3),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "SALES"]),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "currentPassword is required"),
  newPassword: z.string().min(6, "newPassword must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, "resetToken is required"),
  newPassword: z.string().min(6, "newPassword must be at least 6 characters"),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

export const userIdParamSchema = z.object({
  userId: z.string().uuid("Invalid userId"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
