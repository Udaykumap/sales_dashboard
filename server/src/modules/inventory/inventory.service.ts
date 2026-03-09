// src/modules/inventory/inventory.service.ts

import { prisma } from '../../config/adapter';
import { CreateInventoryRequest, UpdateInventoryRequest, InventoryItem, GetInventoryFilter } from './inventory.types';

export class InventoryService {
  // Create new inventory record for a product
  async createInventory(inventoryData: CreateInventoryRequest): Promise<InventoryItem> {
    try {
      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: inventoryData.productId }
      });
      if (!product) throw new Error('Product not found');

      // Check if inventory already exists for this product
      const existingInventory = await prisma.inventory.findUnique({
        where: { productId: inventoryData.productId }
      });
      if (existingInventory) throw new Error('Inventory record already exists for this product');

      const inventory = await prisma.inventory.create({
        data: inventoryData,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          }
        }
      });

      return this.formatInventoryResponse(inventory);
    } catch (error) {
      throw error;
    }
  }

  // Get all inventory items with filters
  async getAllInventory(filters: GetInventoryFilter = {}): Promise<{ items: InventoryItem[]; total: number }> {
    try {
      const {
        productId,
        lowStock = false,
        limit = 10,
        offset = 0,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = filters;

      // Build where clause
      const where: any = {};
      if (productId) where.productId = productId;
      if (lowStock) {
        where.quantity = {
          lte: prisma.inventory.fields.reorderLevel
        };
      }

      const inventory = await prisma.inventory.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset
      });

      const total = await prisma.inventory.count({ where });

      return {
        items: inventory.map(item => this.formatInventoryResponse(item)),
        total
      };
    } catch (error) {
      throw error;
    }
  }

  // Get inventory by product ID
  async getInventoryByProductId(productId: string): Promise<InventoryItem> {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { productId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          }
        }
      });

      if (!inventory) throw new Error('Inventory record not found for this product');

      return this.formatInventoryResponse(inventory);
    } catch (error) {
      throw error;
    }
  }

  // Update inventory
  async updateInventory(productId: string, updateData: UpdateInventoryRequest): Promise<InventoryItem> {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { productId }
      });
      if (!inventory) throw new Error('Inventory record not found');

      const updatedInventory = await prisma.inventory.update({
        where: { productId },
        data: {
          ...updateData,
          updatedAt: new Date()
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          }
        }
      });

      return this.formatInventoryResponse(updatedInventory);
    } catch (error) {
      throw error;
    }
  }

  // Delete inventory record
  async deleteInventory(productId: string): Promise<void> {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { productId }
      });
      if (!inventory) throw new Error('Inventory record not found');

      await prisma.inventory.delete({
        where: { productId }
      });
    } catch (error) {
      throw error;
    }
  }

  // Adjust inventory quantity (for order fulfillment)
  async adjustQuantity(productId: string, quantityChange: number): Promise<InventoryItem> {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { productId }
      });
      if (!inventory) throw new Error('Inventory record not found');

      const newQuantity = inventory.quantity + quantityChange;
      if (newQuantity < 0) throw new Error('Insufficient inventory');

      const updatedInventory = await prisma.inventory.update({
        where: { productId },
        data: {
          quantity: newQuantity,
          updatedAt: new Date()
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          }
        }
      });

      return this.formatInventoryResponse(updatedInventory);
    } catch (error) {
      throw error;
    }
  }

  // Get low stock alerts
  async getLowStockAlerts(): Promise<InventoryItem[]> {
    try {
      const lowStockItems = await prisma.inventory.findMany({
        where: {
          quantity: {
            lte: prisma.inventory.fields.reorderLevel
          }
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          }
        },
        orderBy: {
          quantity: 'asc'
        }
      });

      return lowStockItems.map(item => this.formatInventoryResponse(item));
    } catch (error) {
      throw error;
    }
  }

  // Helper method to format inventory response
  private formatInventoryResponse(inventory: any): InventoryItem {
    return {
      id: inventory.id,
      productId: inventory.productId,
      quantity: inventory.quantity,
      reorderLevel: inventory.reorderLevel,
      updatedAt: inventory.updatedAt.toISOString(),
      product: inventory.product ? {
        id: inventory.product.id,
        name: inventory.product.name,
        sku: inventory.product.sku
      } : undefined
    };
  }
}
