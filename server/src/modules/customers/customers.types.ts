// Type definitions for Customers module

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CustomerResponse {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  createdAt: Date;
}

export interface GetCustomersFilter {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
