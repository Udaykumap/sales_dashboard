// src/modules/customers/customers.validation.ts

import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().min(1, "Phone is required").optional(),
  address: z.string().optional(),
});