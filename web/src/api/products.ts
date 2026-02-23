import { api } from "./http";
import type { Paginated, Product } from "./types";

export type ProductsFilter = {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  minStock?: string;
  maxStock?: string;
};

export async function listProducts(filters: ProductsFilter, page = 1, limit = 10) {
  const res = await api.get<Paginated<Product>>("/products", {
    params: { ...filters, page, limit },
  });
  return res.data;
}

export async function listStoreProducts(storeId: string, page = 1, limit = 10) {
  const res = await api.get<Paginated<Product>>(`/stores/${storeId}/products`, {
    params: { page, limit },
  });
  return res.data;
}

export async function createProduct(
  storeId: string,
  input: { name: string; category: string; price: number; quantity: number }
) {
  const res = await api.post<{ data: Product }>(`/stores/${storeId}/products`, input);
  return res.data.data;
}