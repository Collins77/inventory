import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { listStores } from "../api/stores";
import { listProducts } from "../api/products";
import { getStoreMetrics } from "../api/stores";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import type { Store } from "../api/types";


type StoreMetrics = {
  totalProducts: number;
  totalStock: number;
  totalInventoryValue: number;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");

  const [storesCount, setStoresCount] = useState(0);
  const [productsTotal, setProductsTotal] = useState<number>(0);

  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metrics, setMetrics] = useState<StoreMetrics>({
    totalProducts: 0,
    totalStock: 0,
    totalInventoryValue: 0,
  });

  const selectedStore = useMemo(() => {
    if (selectedStoreId === "all") return null;
    return stores.find((s) => s.id === selectedStoreId) ?? null;
  }, [selectedStoreId, stores]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const storesRes = await listStores();
        setStores(storesRes);
        setStoresCount(storesRes.length);

        // Products total (all stores) — uses meta when available
        const productsRes = await listProducts({}, 1, 1);
        const total = productsRes.meta?.total ?? productsRes.data.length;
        setProductsTotal(total);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load metrics when store selection changes
  useEffect(() => {
    (async () => {
      if (selectedStoreId === "all") {
        // “All” dashboard: we can only show what the API provides.
        // Here we show total products (from /products) and keep stock as 0 unless you add a global metrics endpoint.
        setMetricsLoading(true);
        try {
          const productsRes = await listProducts({}, 1, 1);
          const totalProducts = productsRes.meta?.total ?? productsRes.data.length;
          setMetrics((m) => ({
            ...m,
            totalProducts,
            totalStock: 0,
            totalInventoryValue: 0,
          }));
        } finally {
          setMetricsLoading(false);
        }
        return;
      }

      setMetricsLoading(true);
      try {
        const m = await getStoreMetrics(selectedStoreId);
        setMetrics({
          totalProducts: m.totalProducts,
          totalStock: m.totalStock,
          totalInventoryValue: m.totalInventoryValue,
        });
      } finally {
        setMetricsLoading(false);
      }
    })();
  }, [selectedStoreId]);

  const scopeLabel =
    selectedStoreId === "all"
      ? "All stores"
      : selectedStore
      ? selectedStore.name
      : "Selected store";

  return (
    <div className="flex min-h-[calc(100dvh-140px)] flex-col">
      {/* Top header row */}
      <PageHeader
        title="Dashboard"
        subtitle="Quick overview of your inventory system."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-xl">
              API: localhost:4000
            </Badge>

            <div className="w-55">
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger className="h-9 rounded-2xl">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stores</SelectItem>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStoreId !== "all" && (
              <Button asChild variant="outline" className="h-9 rounded-2xl">
                <Link to={`/stores/${selectedStoreId}`}>View store</Link>
              </Button>
            )}
          </div>
        }
      />

      {/* Content should stretch/fill */}
      <div className="mt-4 flex flex-1 flex-col gap-4">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Stores</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-4">
              <div>
                {loading ? (
                  <Skeleton className="h-9 w-24 rounded-xl" />
                ) : (
                  <div className="text-3xl font-semibold">{storesCount}</div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Total stores registered
                </div>
              </div>

              <Button asChild variant="ghost" className="rounded-2xl">
                <Link to="/stores">Open</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Products ({scopeLabel})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-4">
              <div>
                {loading || metricsLoading ? (
                  <Skeleton className="h-9 w-24 rounded-xl" />
                ) : (
                  <div className="text-3xl font-semibold">{metrics.totalProducts}</div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Count of products in scope
                </div>
              </div>

              <Button asChild variant="ghost" className="rounded-2xl">
                <Link to="/products">Open</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Total Stock Amount ({scopeLabel})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-4">
              <div>
                {metricsLoading ? (
                  <Skeleton className="h-9 w-24 rounded-xl" />
                ) : (
                  <div className="text-3xl font-semibold">{metrics.totalStock}</div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Sum of quantities in scope
                </div>

                {selectedStoreId === "all" && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Tip: choose a store to see stock totals (global stock needs a global metrics endpoint).
                  </div>
                )}
              </div>

              {selectedStoreId !== "all" ? (
                <Button asChild variant="ghost" className="rounded-2xl">
                  <Link to={`/stores/${selectedStoreId}`}>Details</Link>
                </Button>
              ) : (
                <Button asChild variant="ghost" className="rounded-2xl">
                  <Link to="/stores">Stores</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main panels fill the remaining height */}
        <div className="grid flex-1 gap-4 lg:grid-cols-3">
          <Card className="rounded-2xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-2xl">
                  <Link to="/stores">Manage Stores</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl">
                  <Link to="/products">Browse Products</Link>
                </Button>

                {selectedStoreId !== "all" && (
                  <Button asChild variant="secondary" className="rounded-2xl">
                    <Link to={`/stores/${selectedStoreId}`}>Store Overview</Link>
                  </Button>
                )}
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                Scope is currently <span className="font-medium text-foreground">{scopeLabel}</span>.
                Use the selector in the header to switch between a specific store or all stores.
              </div>

              <div className="rounded-2xl border bg-muted/30 p-3 text-sm">
                <div className="font-medium">Products total (all stores)</div>
                {loading ? (
                  <Skeleton className="mt-2 h-6 w-28 rounded-xl" />
                ) : (
                  <div className="mt-1 text-lg font-semibold">{productsTotal}</div>
                )}
                <div className="mt-1 text-xs text-muted-foreground">
                  This uses pagination meta when available.
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>• Create a store, then add products.</div>
              <div>• Verify store metrics update (products, stock, inventory value).</div>
              <div>• Use Products filters and confirm pagination behaves.</div>
              <div>• Trigger validation errors and confirm messages are clean.</div>

              <Separator className="my-2" />

              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="rounded-2xl">
                  <Link to="/stores">Go to Stores</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl">
                  <Link to="/products">Go to Products</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* footer spacer for nicer layout */}
        <div className="h-2" />
      </div>
    </div>
  );
}