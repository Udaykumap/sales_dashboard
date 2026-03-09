import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as productService from "./products.service";


export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await productService.createProductService(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product", error });
  }
};
export const getProducts = async (_req: AuthRequest, res: Response) => {
  try {
    const products = await productService.getProductsService();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
};
export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await productService.getProductByIdService(id);
 
    if (!product)
      return res.status(404).json({ message: "Product not found" });
 
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error });
  }
};
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await productService.updateProductService(
      id,
      req.body
    );
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error });
  }
};
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await productService.deleteProductService(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error });
  }
};