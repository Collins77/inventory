export type Store = {
    id: string;
    name: string;
    location?: string | null;
    createdAt: string;
    updatedAt: string;
}

export type Product = {
    id: string;
    storeId: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
};

export type ApiErrorPayload = {
    error?: {
        type?: string;
        message?: string;
        fieldErrors?: Record<string, string[]>;
    };
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta?: Partial<PaginationMeta>;
};