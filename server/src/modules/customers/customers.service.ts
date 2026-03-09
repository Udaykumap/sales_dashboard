import { prisma } from '../../config/adapter';
import { CreateCustomerRequest, GetCustomersFilter, CustomerResponse, UpdateCustomerRequest } from './customers.types';

// import { PrismaClient } from '@prisma/client';

// Prisma singleton for dev
// declare global {
//   var prisma: PrismaClient | undefined;
// }

// const prisma = globalThis.prisma || new PrismaClient();
// if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export class CustomerService {
  async createCustomer(data: CreateCustomerRequest): Promise<CustomerResponse> {
    // basic dedupe by email or phone
    if (data.email) {
      const exists = await prisma.customer.findFirst({ where: { email: data.email } });
      if (exists) throw new Error('Customer with this email already exists');
    }
    const byPhone = await prisma.customer.findFirst({ where: { phone: data.phone } });
    if (byPhone) throw new Error('Customer with this phone already exists');     

    const customer = await prisma.customer.create({ data });
    return this.format(customer);
  }

  async listCustomers(filters: GetCustomersFilter = {}): Promise<{ customers: CustomerResponse[]; total: number }> {
    const { search, limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset
    });

    const total = await prisma.customer.count({ where });

    return { customers: customers.map(c => this.format(c)), total };
  }

  async getCustomerById(id: string): Promise<CustomerResponse> {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new Error('Customer not found');
    return this.format(customer);
  }

  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<CustomerResponse> {
    // dedupe email/phone if provided
    if (data.email) {
      const exists = await prisma.customer.findFirst({ where: { email: data.email, NOT: { id } } });
      if (exists) throw new Error('Another customer with this email exists');
    }
    if (data.phone) {
      const exists = await prisma.customer.findFirst({ where: { phone: data.phone, NOT: { id } } });
      if (exists) throw new Error('Another customer with this phone exists');
    }

    const updated = await prisma.customer.update({ where: { id }, data });
    return this.format(updated);
  }

  async deleteCustomer(id: string): Promise<void> {
    // consider safety: don't delete if orders exist
    const orders = await prisma.order.findFirst({ where: { customerId: id } });
    if (orders) throw new Error('Cannot delete customer with existing orders');
    await prisma.customer.delete({ where: { id } });
  }

  private format(c: any): CustomerResponse {
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      createdAt: c.createdAt
    };
  }
}

export default new CustomerService();
