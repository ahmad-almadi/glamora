import { Request, Response } from "express";
import { getAllProductsService, getProductsByCategoryService, getAllCategories, getProductByIdService } from "../services/product.service.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;

    let products;
    if (categoryId && categoryId !== "all") {
      // جلب حسب التصنيف
      products = await getProductsByCategoryService(categoryId as string);
    } else {
      // جلب كل المنتجات
      products = await getAllProductsService();
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();
    res.json(categories); // ترجع كل الفئات
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product = await getProductByIdService(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};
//////////admin///////////

import { createProductService, updateProductService, deleteProductService } from "../services/product.service.js";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    if (req.file) {
      productData.imageUrl = `/uploads/${req.file.filename}`;
    }
    // Parse quantity and price if they come as strings from FormData
    if (typeof productData.quantity === 'string') productData.quantity = parseInt(productData.quantity);
    if (typeof productData.price === 'string') productData.price = parseFloat(productData.price);
    if (typeof productData.isNew === 'string') productData.isNew = productData.isNew === 'true';
    if (typeof productData.variants === 'string') {
      try {
        productData.variants = JSON.parse(productData.variants);
      } catch (e) {
        console.error("Failed to parse variants", e);
        productData.variants = [];
      }
    }

    const product = await createProductService(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const productData = req.body;
    if (req.file) {
      productData.imageUrl = `/uploads/${req.file.filename}`;
    }
    // Parse quantity and price if they come as strings from FormData
    if (typeof productData.quantity === 'string') productData.quantity = parseInt(productData.quantity);
    if (typeof productData.price === 'string') productData.price = parseFloat(productData.price);
    if (typeof productData.isNew === 'string') productData.isNew = productData.isNew === 'true';
    if (typeof productData.variants === 'string') {
      try {
        productData.variants = JSON.parse(productData.variants);
      } catch (e) {
        console.error("Failed to parse variants", e);
        productData.variants = [];
      }
    }

    const product = await updateProductService(id, productData);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // نأكد إنه string
    await deleteProductService(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
