import { Request, Response } from 'express';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/category.service.js';

export const getCategoriesController = async (req: Request, res: Response) => {
    try {
        const categories = await getAllCategories();
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories" });
    }
};

export const createCategoryController = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const category = await createCategory(name);
        res.status(201).json(category);
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Failed to create category" });
    }
};

export const updateCategoryController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const category = await updateCategory(id as string, name);
        res.json(category);
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Failed to update category" });
    }
};

export const deleteCategoryController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await deleteCategory(id as string);
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ message: "Failed to delete category" });
    }
};
