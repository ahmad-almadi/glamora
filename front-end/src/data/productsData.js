
import axios from "axios"; //HTTP client to fetch products from your backend.

const API_BASE = import.meta.env.VITE_API_URL || "https://glamora.up.railway.app";

// Get all products, optionally filtered by categoryId
export async function getProducts(categoryId) {
  const url =
    (categoryId && categoryId !== "all")
      ? `${API_BASE}/products?categoryId=${categoryId}` // get all product filtered by category
      : `${API_BASE}/products`; //get all prodcucts

  const res = await axios.get(url);
  return res.data;
}

// Get all categories
export async function getCategories() {
  const res = await axios.get(`${API_BASE}/products/categories`);
  return res.data;
}

// Get a single product by ID
export async function getProductById(productId) {
  try {
    // Try the direct endpoint first
    const res = await axios.get(`${API_BASE}/products/${productId}`);
    return res.data;
  } catch (err) {
    // If that fails, fetch all products and find the one we need
    console.log("Single product endpoint not available, fetching all products...");
    const allProducts = await getProducts();
    const id = parseInt(productId) || productId;
    const product = allProducts.find(p => p.id === id || p.id === productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }
}

// Get related products (same category, excluding current product)
export async function getRelatedProducts(productId, limit = 4) {
  try {
    // Get all products first
    const allProducts = await getProducts();
    const id = parseInt(productId) || productId;

    // Find the current product
    const currentProduct = allProducts.find(p => p.id === id || p.id === productId);

    if (!currentProduct) {
      return [];
    }

    // Filter to same category, excluding current product
    return allProducts
      .filter(p =>
        p.categoryId === currentProduct.categoryId &&
        p.id !== id &&
        p.id !== productId
      )
      .slice(0, limit);
  } catch (err) {
    console.error("Failed to get related products:", err);
    return [];
  }
}

