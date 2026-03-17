import type { Store, Product } from "../generated/prisma/client";

// Domain types
export interface CreateStoreRequest {
  name: string;
  location?: string;
}

export interface UpdateStoreRequest {
  name?: string;
  location?: string;
}

export interface CreateProductRequest {
  storeId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface CreateStoreProductRequest {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface UpdateProductRequest {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface ProductsFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface StoreMetrics {
  totalProducts: number;
  totalStock: number;
  totalInventoryValue: number;
}

// API Response types
export interface StoreResponse extends Store {}

export interface ProductResponse extends Product {
  store: Pick<Store, "id" | "name">;
}

export interface PaginatedProductsResponse {
  data: ProductResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  details?: any;
}