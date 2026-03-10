import { prisma } from '../../config/adapter';
import { CreateOrderRequest, GetOrdersFilter, OrderResponse, OrderStatistics } from './orders.types';
import { OrderStatus } from '@prisma/client';
import { AuthPayload } from '../../middleware/auth.middleware';


export class OrderService {
  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    try {
      // Validate customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: orderData.customerId }
      });
      if (!customer) throw new Error('Customer not found');

      // Validate user exists
      const user = await prisma.user.findUnique({
        where: { id: orderData.userId }
      });
      if (!user) throw new Error('User not found');

      // Validate and check inventory for all products
      let totalAmount = 0;
      const orderItems = [];

      for (const item of orderData.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { inventory: true }
        });

        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (!product.inventory) throw new Error(`Product ${product.name} has no inventory record`);
        if (product.inventory.quantity < item.quantity) {
          throw new Error(`Insufficient inventory for ${product.name}. Available: ${product.inventory.quantity}`);
        }

        totalAmount += product.price * item.quantity;
        orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
      }

      // Create order with items in transaction
      const order = await prisma.order.create({
        data: {
          customerId: orderData.customerId,
          userId: orderData.userId,
          status: 'PAID',
          totalAmount,
          paymentMethod: orderData.paymentMethod,
          items: {
            create: orderItems
          }
        },
        include: {
          customer: true,
          user: true,
          items: true
        }
      });

      // Deduct inventory
      for (const item of orderData.items) {
        await prisma.inventory.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
      }

      return this.formatOrderResponse(order);
    } catch (error) {
      throw error;
    }
  }

  // Get all orders with filters
  async getAllOrders(filters: GetOrdersFilter = {}, requester?: AuthPayload): Promise<{ orders: OrderResponse[]; total: number }> {
    try {
      const {
        status = 'PAID',
        customerId,
        userId,
        startDate,
        endDate,
        limit = 10,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      let validatedStatus: OrderStatus | undefined;
      if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
        validatedStatus = status as OrderStatus;
      }

      // Build where clause
      const where: any = {};
      
      if (validatedStatus) where.status = validatedStatus;
      if (customerId) where.customerId = customerId;
      if (userId) where.userId = userId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      // Non-admin users can only see their own orders
      if (requester && requester.role !== "ADMIN") {
        where.userId = requester.id;
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          customer: true,
          user: true,
          items: { include: { product: true } }
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset
      });

      const total = await prisma.order.count({ where });

      return {
        orders: orders.map(order => this.formatOrderResponse(order)),
        total
      };
    } catch (error) {
      throw error;
    }
  }

  // Get single order by ID
  async getOrderById(orderId: string, requester?: AuthPayload): Promise<OrderResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          customer: true,
          user: true,
          items: { include: { product: true } }
        }
      });

      if (!order) throw new Error('Order not found');

      // Non-admin users can only see their own orders
      if (requester && requester.role !== "ADMIN" && order.userId !== requester.id) {
        throw new Error('Forbidden: You can only view your own orders');
      }

      return this.formatOrderResponse(order);
    } catch (error) {
      throw error;
    }
  }

  // Get order statistics
  async getOrderStatistics(): Promise<OrderStatistics> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Total orders
      const totalOrders = await prisma.order.count();
      const paidOrders = await prisma.order.count({ where: { status: 'PAID' } });
      const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
      const totalOrdersToday = await prisma.order.count({ where: { createdAt: { gte: todayStart } } });
      const totalOrdersThisWeek = await prisma.order.count({ where: { createdAt: { gte: weekStart } } });
      const totalOrdersThisMonth = await prisma.order.count({ where: { createdAt: { gte: monthStart } } });

      // Total sales
      const aggregations = await prisma.order.aggregate({
        _sum: { totalAmount: true }
      });
      const totalSalesAmount = aggregations._sum.totalAmount || 0;

      const todaySales = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: todayStart } }
      });
      const totalSalesAmountToday = todaySales._sum.totalAmount || 0;

      const weekSales = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: weekStart } }
      });
      const totalSalesAmountThisWeek = weekSales._sum.totalAmount || 0;

      const monthSales = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { createdAt: { gte: monthStart } }
      });
      const totalSalesAmountThisMonth = monthSales._sum.totalAmount || 0;

      // Top selling products
      const topSellingProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10
      });

      const topProducts = await Promise.all(
        topSellingProducts.map(async (item) => {
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          return {
            productId: item.productId,
            productName: product?.name || 'Unknown',
            totalQuantity: item._sum.quantity || 0,
            totalRevenue: (item._sum.price || 0) * (item._sum.quantity || 1)
          };
        })
      );

      // Top customers
      const topCustomerAgg = await prisma.order.groupBy({
        by: ['customerId'],
        _count: { id: true },
        _sum: { totalAmount: true },
        orderBy: [{ _sum: { totalAmount: 'desc' } }],
        take: 10
      });

      const topCustomers = await Promise.all(
        topCustomerAgg.map(async (item) => {
          const customer = await prisma.customer.findUnique({ where: { id: item.customerId } });
          return {
            customerId: item.customerId,
            customerName: customer?.name || 'Unknown',
            totalOrders: item._count.id,
            totalSpent: item._sum.totalAmount || 0
          };
        })
      );

      // Top sales users
      const topUsersAgg = await prisma.order.groupBy({
        by: ['userId'],
        _count: { id: true },
        _sum: { totalAmount: true },
        orderBy: [{ _sum: { totalAmount: 'desc' } }],
        take: 10
      });

      const topSalesUsers = await Promise.all(
        topUsersAgg.map(async (item) => {
          const user = await prisma.user.findUnique({ where: { id: item.userId } });
          return {
            userId: item.userId,
            userName: user?.name || 'Unknown',
            totalOrders: item._count.id,
            totalRevenue: item._sum.totalAmount || 0
          };
        })
      );

      return {
        totalOrders,
        paidOrders,
        pendingOrders,
        totalOrdersToday,
        totalOrdersThisWeek,
        totalOrdersThisMonth,
        totalSalesAmount,
        totalSalesAmountToday,
        totalSalesAmountThisWeek,
        totalSalesAmountThisMonth,
        totalRevenue: totalSalesAmount,
        topSellingProducts: topProducts,
        topCustomers,
        topSalesUsers
      };
    } catch (error) {
      throw error;
    }
  }

  // Helper method to format order response
  private formatOrderResponse(order: any): OrderResponse {
    return {
      id: order.id,
      customerId: order.customerId,
      customerName: order.customer?.name,
      customerPhone: order.customer?.phone,
      userId: order.userId,
      userName: order.user?.name,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      items: order.items?.map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.product?.name,
        quantity: item.quantity,
        price: item.price
      }))
    };
  }
}
