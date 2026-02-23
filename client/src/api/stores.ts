import { api } from "./http";
import type { Store } from "./types";

export async function listStores() {
  const res = await api.get<{ data: Store[] }>("/stores");
  console.log(res.data)
  return res.data.data;
}

export async function createStore(input: { name: string; location?: string }) {
  const res = await api.post<{ data: Store }>("/stores", input);
  return res.data.data;
}

export async function getStore(storeId: string) {
  const res = await api.get<{ data: Store }>(`/stores/${storeId}`);
  return res.data.data;
}

export async function getStoreMetrics(storeId: string) {
  const res = await api.get<{
    data: { totalProducts: number; totalStock: number; totalInventoryValue: number };
  }>(`/stores/${storeId}/metrics`);
  return res.data.data;
}