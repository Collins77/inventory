import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import FieldErrors from "../components/FieldErrors";
import EmptyState from "../components/EmptyState";
import { listProducts, type ProductsFilter } from "../api/products";
import type { PaginationMeta, Product } from "../api/types";
import { parseApiError } from "../utils/parseError";
import { formatMoney } from "../utils/money";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "sonner";

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductsFilter>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Partial<PaginationMeta> | null>(null);

  const [page, setPage] = useState(1);
  const limit = 10;

  async function load() {
    setFieldErrors({});
    try {
      const res = await listProducts(filters, page, limit);
      setProducts(res.data);
      setMeta(res.meta || null);
    } catch (err) {
      const p = parseApiError(err);
      setFieldErrors(p.fieldErrors);
      toast.error(p.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function set(key: keyof ProductsFilter, value: string) {
    setFilters((prev) => {
      const v = value.trim();
      if (!v) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: v };
    });
  }

  function apply() {
    setPage(1);
    load();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        subtitle="Global search and filters."
        right={
          <Button variant="outline" className="rounded-2xl" onClick={apply}>
            Apply
          </Button>
        }
      />

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldErrors fieldErrors={fieldErrors} />

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Input placeholder="Electronics" onChange={(e) => set("category", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Min price</Label>
              <Input placeholder="0" onChange={(e) => set("minPrice", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Max price</Label>
              <Input placeholder="10000" onChange={(e) => set("maxPrice", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Min stock</Label>
              <Input placeholder="0" onChange={(e) => set("minStock", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Max stock</Label>
              <Input placeholder="1000" onChange={(e) => set("maxStock", e.target.value)} />
            </div>

            <div className="flex items-end">
              <Button className="w-full rounded-2xl" onClick={apply}>
                Apply filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Results</CardTitle>
          {meta?.total != null ? <Badge variant="secondary" className="rounded-xl">Total: {meta.total}</Badge> : null}
        </CardHeader>

        <CardContent>
          {products.length === 0 ? (
            <EmptyState title="No results" subtitle="Adjust filters or add more products." />
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
                  disabled={meta?.totalPages ? page >= meta.totalPages : true}
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