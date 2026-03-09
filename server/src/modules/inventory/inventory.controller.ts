// src/modules/inventory/inventory.controller.ts

import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { InventoryService } from './inventory.service';
import { CreateInventoryRequest, UpdateInventoryRequest, InventoryResponse, GetInventoryFilter } from './inventory.types';

const inventoryService = new InventoryService();

// Create new inventory record
export const createInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inventoryData: CreateInventoryRequest = req.body;

    // Basic validation
    if (!inventoryData.productId || inventoryData.quantity === undefined || inventoryData.reorderLevel === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: productId, quantity, reorderLevel'
      } as InventoryResponse);
      return;
    }

    if (inventoryData.quantity < 0 || inventoryData.reorderLevel < 0) {
      res.status(400).json({
        success: false,
        error: 'Quantity and reorder level must be non-negative'
      } as InventoryResponse);
      return;
    }

    const inventory = await inventoryService.createInventory(inventoryData);
    res.status(201).json({
      success: true,
      data: inventory,
      message: 'Inventory record created successfully'
    } as InventoryResponse);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create inventory record'
    } as InventoryResponse);
  }
};

// Get all inventory items with filters
export const getAllInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters: GetInventoryFilter = {
      productId: req.query.productId as string,
      lowStock: req.query.lowStock === 'true',
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      sortBy: (req.query.sortBy as 'updatedAt' | 'quantity') || 'updatedAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    };

    const result = await inventoryService.getAllInventory(filters);
    res.status(200).json({
      success: true,
      data: result.items,
      message: `Retrieved ${result.items.length} inventory items`,
      total: result.total
    } as any);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch inventory'
    } as InventoryResponse);
  }
};

// Get inventory by product ID
export const getInventoryByProductId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

    if (!productId) {
      res.status(400).json({
        success: false,
        error: 'Product ID is required'
      } as InventoryResponse);
      return;
    }

    const inventory = await inventoryService.getInventoryByProductId(productId);
    res.status(200).json({
      success: true,
      data: inventory
    } as InventoryResponse);
  } catch (error: any) {
    if (error.message === 'Inventory record not found for this product') {
      res.status(404).json({
        success: false,
        error: 'Inventory record not found'
      } as InventoryResponse);
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch inventory'
      } as InventoryResponse);
    }
  }
};

// Update inventory
export const updateInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
    const updateData: UpdateInventoryRequest = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        error: 'Product ID is required'
      } as InventoryResponse);
      return;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        error: 'At least one field must be provided for update'
      } as InventoryResponse);
      return;
    }

    if (updateData.quantity !== undefined && updateData.quantity < 0) {
      res.status(400).json({
        success: false,
        error: 'Quantity must be non-negative'
      } as InventoryResponse);
      return;
    }

    if (updateData.reorderLevel !== undefined && updateData.reorderLevel < 0) {
      res.status(400).json({
        success: false,
        error: 'Reorder level must be non-negative'
      } as InventoryResponse);
      return;
    }

    const inventory = await inventoryService.updateInventory(productId, updateData);
    res.status(200).json({
      success: true,
      data: inventory,
      message: 'Inventory updated successfully'
    } as InventoryResponse);
  } catch (error: any) {
    if (error.message === 'Inventory record not found') {
      res.status(404).json({
        success: false,
        error: 'Inventory record not found'
      } as InventoryResponse);
    } else {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update inventory'
      } as InventoryResponse);
    }
  }
};

// Delete inventory record
export const deleteInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;

    if (!productId) {
      res.status(400).json({
        success: false,
        error: 'Product ID is required'
      } as InventoryResponse);
      return;
    }

    await inventoryService.deleteInventory(productId);
    res.status(200).json({
      success: true,
      message: 'Inventory record deleted successfully'
    } as InventoryResponse);
  } catch (error: any) {
    if (error.message === 'Inventory record not found') {
      res.status(404).json({
        success: false,
        error: 'Inventory record not found'
      } as InventoryResponse);
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete inventory'
      } as InventoryResponse);
    }
  }
};

// Adjust inventory quantity
export const adjustInventoryQuantity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
    const { quantityChange } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        error: 'Product ID is required'
      } as InventoryResponse);
      return;
    }

    if (quantityChange === undefined || typeof quantityChange !== 'number') {
      res.status(400).json({
        success: false,
        error: 'quantityChange must be a number'
      } as InventoryResponse);
      return;
    }

    const inventory = await inventoryService.adjustQuantity(productId, quantityChange);
    res.status(200).json({
      success: true,
      data: inventory,
      message: 'Inventory quantity adjusted successfully'
    } as InventoryResponse);
  } catch (error: any) {
    if (error.message === 'Inventory record not found') {
      res.status(404).json({
        success: false,
        error: 'Inventory record not found'
      } as InventoryResponse);
    } else {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to adjust inventory'
      } as InventoryResponse);
    }
  }
};

// Get low stock alerts
export const getLowStockAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lowStockItems = await inventoryService.getLowStockAlerts();
    res.status(200).json({
      success: true,
      data: lowStockItems,
      message: `Found ${lowStockItems.length} items with low stock`
    } as any);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch low stock alerts'
    } as InventoryResponse);
  }
};