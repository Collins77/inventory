import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { listStores } from "../api/stores";
import { listProducts } from "../api/products";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [storesCount, setStoresCount] = useState(0);
  const [productsTotal, setProductsTotal] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const stores = await listStores();
        const products = await listProducts({}, 1, 1);
        setStoresCount(stores.length);
        setProductsTotal(products.meta?.total ?? products.data.length);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        subtitle="Quick overview of your inventory system."
        right={<Badge variant="secondary" className="rounded-xl">API: localhost:4000</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Stores</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-24 rounded-xl" />
            ) : (
              <div className="text-3xl font-semibold">{storesCount}</div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">Total stores registered</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-24 rounded-xl" />
            ) : (
              <div className="text-3xl font-semibold">{productsTotal ?? 0}</div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">Total products across all stores</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• Create a store, then add products.</div>
          <div>• Verify store metrics update (products, stock, inventory value).</div>
          <div>• Use Products filters and confirm pagination behaves.</div>
          <div>• Trigger validation errors and confirm messages are clean.</div>
        </CardContent>
      </Card>
    </div>
  );
}