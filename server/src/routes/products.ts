import { Router } from "express";
import { paginationSchema, uuidSchema } from "../validators/common.js";
import { productsFilterSchema, updateProductSchema, createProductSchema } from "../validators/products.js";
import { asyncHandler } from "../types/express.js";
import type {
  CreateProductRequest,
  UpdateProductRequest,
  ProductsFilter,
  ProductResponse,
  PaginatedProductsResponse
} from "../types/api.js";
import {
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "../services/products.js";
import { getStoreById, createStoreProduct } from "../services/stores.js";

export const productsRouter = Router();

// POST /products
productsRouter.post("/", asyncHandler(async (req, res) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { storeId, ...productData } = parsed.data;

  const store = await getStoreById(storeId);
  if (!store) {
    return res.status(404).json({ error: "Store not found" });
  }

  const product = await createStoreProduct(storeId, productData);

  res.status(201).json({ data: product });
}));

// GET /products?category=&minPrice=&maxPrice=&minStock=&maxStock=&page=&limit=
productsRouter.get("/", asyncHandler(async (req, res) => {
  const pg = paginationSchema.safeParse(req.query);
  if (!pg.success) {
    return res.status(400).json({ error: "Invalid pagination" });
  }

  const filters = productsFilterSchema.safeParse(req.query);
  if (!filters.success) {
    return res.status(400).json({ error: "Invalid filters" });
  }

  const { page, limit } = pg.data;
  const { products, total } = await getProducts(filters.data, page, limit);

  res.json({
    data: products,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
}));

// PATCH /products/:id
productsRouter.patch("/:id", asyncHandler(async (req, res) => {
  const id = uuidSchema.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const exists = await getProductById(id.data);
  if (!exists) {
    return res.status(404).json({ error: "Product not found" });
  }

  const updated = await updateProduct(id.data, parsed.data);

  res.json({ data: updated });
}));

// DELETE /products/:id
productsRouter.delete("/:id", asyncHandler(async (req, res) => {
  const id = uuidSchema.safeParse(req.params.id);
  if (!id.success) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const exists = await getProductById(id.data);
  if (!exists) {
    return res.status(404).json({ error: "Product not found" });
  }

  await deleteProduct(id.data);
  res.status(204).send();
}));