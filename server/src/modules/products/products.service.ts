import { prisma } from '../../config/adapter'
import {
  CreateProductInput,
  UpdateProductInput,
} from "../products/products.types";

export const createProductService = async (data: CreateProductInput) => {
  const { name, sku, description, price, costPrice, categoryId } = data;
  return await prisma.product.create({
    data: {
      name,
      sku,
      description,
      price: Number(price),
      costPrice: Number(costPrice),
      categoryId,
      inventory: {
        create: {
          quantity: 0,
          reorderLevel: 0,
        },
      },
    },
    include: {
      category: true,
      inventory: true,
    },
  });
};
export const getProductsService = async () => {
  return await prisma.product.findMany({
    include: {
      category: true,
      inventory: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
export const getProductByIdService = async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      inventory: true,
    },
  });
};
export const updateProductService = async (
  id: string,
  data: UpdateProductInput
) => {
  const { name, sku, description, price, costPrice, categoryId } = data;
  return await prisma.product.update({
    where: { id },
    data: {
      name,
      sku,
      description,
      price: price ? Number(price) : undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      categoryId,
    },
    include: {
      category: true,
      inventory: true,
    },
  });
};
export const deleteProductService = async (id: string) => {
  await prisma.inventory.deleteMany({
    where: { productId: id },
  });
 
  return await prisma.product.delete({
    where: { id },
  });
};