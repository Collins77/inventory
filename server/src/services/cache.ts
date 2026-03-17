import NodeCache from "node-cache";

export const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL

export const CACHE_KEYS = {
  STORES: "stores",
  STORE: (id: string) => `store:${id}`,
} as const;