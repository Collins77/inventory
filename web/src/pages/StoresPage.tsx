import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import FieldErrors from "../components/FieldErrors";
import EmptyState from "../components/EmptyState";
import { createStore, listStores } from "../api/stores";
import type { Store } from "../api/types";
import { parseApiError } from "../utils/parseError";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { MapPin, Plus, Store as StoreIcon } from "lucide-react";

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function refresh() {
    setLoading(true);
    try {
      const data = await listStores();
      console.log(data);
      setStores(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    try {
      const created = await createStore({
        name,
        location: location.trim() ? location.trim() : undefined,
      });
      setStores((prev) => [created, ...prev]);
      setName("");
      setLocation("");
      toast.success("Store created");
    } catch (err) {
      const p = parseApiError(err);
      setFieldErrors(p.fieldErrors);
      toast.error(p.message);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stores"
        subtitle="Create and manage stores."
        right={
          <Button variant="outline" className="rounded-2xl" onClick={refresh}>
            Refresh
          </Button>
        }
      />

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Create store</CardTitle>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-3">
          <FieldErrors fieldErrors={fieldErrors} />

          <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CBD Branch" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Nairobi" />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" className="rounded-2xl">
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : stores.length === 0 ? (
        <EmptyState
          title="No stores yet"
          subtitle="Create your first store to start tracking products and inventory."
        />
      ) : (
        <div className="grid gap-3">
          {stores.map((s) => (
            <Card key={s.id} className="rounded-2xl">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-accent">
                    <StoreIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {s.location || "—"}
                    </div>
                  </div>
                </div>

                <Button asChild variant="outline" className="rounded-2xl">
                  <Link to={`/stores/${s.id}`}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}