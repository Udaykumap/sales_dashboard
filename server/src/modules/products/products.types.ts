export interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  price: number | string;
  costPrice: number | string;
  categoryId: string;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  description?: string;
  price?: number | string;
  costPrice?: number | string;
  categoryId?: string;
}