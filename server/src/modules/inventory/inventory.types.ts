// src/modules/inventory/inventory.types.ts

export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  reorderLevel: number;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface CreateInventoryRequest {
  productId: string;
  quantity: number;
  reorderLevel: number;
}

export interface UpdateInventoryRequest {
  quantity?: number;
  reorderLevel?: number;
}

export interface InventoryResponse {
  success: boolean;
  data?: InventoryItem | InventoryItem[];
  message?: string;
  error?: string;
  total?: number;
}

export interface GetInventoryFilter {
  productId?: string;
  lowStock?: boolean; // filter items below reorder level
  limit?: number;
  offset?: number;
  sortBy?: 'updatedAt' | 'quantity';
  sortOrder?: 'asc' | 'desc';
}