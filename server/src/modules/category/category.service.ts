import { prisma } from "../../config/adapter";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../category/category.types";


export const createCategoryService = async (data: CreateCategoryInput) => {
  return await prisma.category.create({ data });
};

export const getCategoriesService = async () => {
  return await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getCategoryByIdService = async (id: string) => {
  return await prisma.category.findUnique({ where: { id } });
};

export const updateCategoryService = async (id: string, data: UpdateCategoryInput) => {
  return await prisma.category.update({ where: { id }, data });
};

export const deleteCategoryService = async (id: string) => {
  return await prisma.category.delete({ where: { id } });
};
