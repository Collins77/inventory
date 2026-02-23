import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import FieldErrors from "../components/FieldErrors";
import EmptyState from "../components/EmptyState";
import { getStore, getStoreMetrics } from "../api/stores";
import { createProduct, listStoreProducts } from "../api/products";
import type { PaginationMeta, Product, Store } from "../api/types";
import { parseApiError } from "../utils/parseError";
import { formatMoney } from "../utils/money";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";

export default function StoreDetailsPage() {
  const { storeId } = useParams();
  const id = storeId || "";

  const [store, setStore] = useState<Store | null>(null);
  const [metrics, setMetrics] = useState<{ totalProducts: number; totalStock: number; totalInventoryValue: number } | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Partial<PaginationMeta> | null>(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const canNext = useMemo(() => {
    if (!meta?.totalPages) return false;
    return page < meta.totalPages;
  }, [meta, page]);

  async function load() {
    setLoading(true);
    try {
      const [s, m, list] = await Promise.all([
        getStore(id),
        getStoreMetrics(id),
        listStoreProducts(id, page, limit),
      ]);
      setStore(s);
      setMetrics(m);
      setProducts(list.data);
      setMeta(list.meta || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    load().catch((err) => toast.error(parseApiError(err).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    try {
      const created = await createProduct(id, {
        name,
        category,
        price: Number(price),
        quantity: Number(quantity),
      });

      setProducts((prev) => [created, ...prev]);
      setName("");
      setCategory("");
      setPrice("");
      setQuantity("");

      setMetrics(await getStoreMetrics(id));
      toast.success("Product added");
    } catch (err) {
      const p = parseApiError(err);
      setFieldErrors(p.fieldErrors);
      toast.error(p.message);
    }
  }

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title={store?.name || "Store"}
        subtitle={store?.location || "—"}
        right={
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/stores">Back</Link>
          </Button>
        }
      />

      {metrics ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Products</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-semibold">{metrics.totalProducts}</div></CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Stock</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-semibold">{metrics.totalStock}</div></CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Inventory Value</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-semibold">{formatMoney(metrics.totalInventoryValue)}</div></CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Add product</CardTitle>
          <Badge variant="secondary" className="rounded-xl">Store</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldErrors fieldErrors={fieldErrors} />

          <form onSubmit={onAdd} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Keyboard" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Electronics" />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 3500" />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 7" />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" className="rounded-2xl">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Products</CardTitle>
          {meta?.total != null ? (
            <Badge variant="secondary" className="rounded-xl">Total: {meta.total}</Badge>
          ) : null}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : products.length === 0 ? (
            <EmptyState title="No products yet" subtitle="Add the first product for this store." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell className="text-right">{formatMoney(p.price)}</TableCell>
                      <TableCell className="text-right">{p.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  disabled={page <= 1}
                  onClick={() => setPage((v) => Math.max(1, v - 1))}
                >
                  Prev
                </Button>

                <div className="text-sm text-muted-foreground">
                  Page {page}{meta?.totalPages ? ` / ${meta.totalPages}` : ""}
                </div>

                <Button
                  variant="outline"
                  className="rounded-2xl"
                  disabled={!canNext}
                  onClick={() => setPage((v) => v + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}