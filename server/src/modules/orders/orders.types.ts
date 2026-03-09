// Type definitions for Orders module

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: string;
  userId: string;
  items: OrderItem[];
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'NETBANKING';
}

export interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
}

export interface OrderResponse {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  userId: string;
  userName?: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date;
  items?: OrderItemResponse[];
}

export interface GetOrdersFilter {
  status?: string;
  customerId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderStatistics {
  totalOrders: number;
  totalOrdersToday: number;
  totalOrdersThisWeek: number;
  totalOrdersThisMonth: number;
  totalSalesAmount: number;
  totalSalesAmountToday: number;
  totalSalesAmountThisWeek: number;
  totalSalesAmountThisMonth: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
  }>;
  topSalesUsers: Array<{
    userId: string;
    userName: string;
    totalOrders: number;
    totalRevenue: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
