import { NavLink, Outlet } from "react-router-dom";
import { Boxes, LayoutDashboard, Package, Store, Menu } from "lucide-react";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Separator } from "../components/ui/separator";
import { cn } from "../lib/utils";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  const base =
    "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition-colors hover:bg-accent";
  const active = "bg-accent";

  const item = (to: string, label: string, Icon: IconType) => (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => cn(base, isActive && active)}
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );

  return (
    <div className="space-y-1">
      {item("/", "Dashboard", LayoutDashboard)}
      {item("/stores", "Stores", Store)}
      {item("/products", "Products", Boxes)}
    </div>
  );
}

const HEADER_HEIGHT = 64;

export default function AppShell() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="h-16 w-full border-b bg-card px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-none">Inventory</div>
              <div className="text-xs text-muted-foreground">Stores • Products • Metrics</div>
            </div>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-2xl">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="mb-3 text-sm font-semibold">Menu</div>
                <Separator className="mb-3" />
                <SideNav />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className="hidden w-70 border-r rounded-lg bg-card p-4 shadow-sm md:block sticky self-start mt-4 ml-2"
          // style={{ top: HEADER_HEIGHT, height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
          style={{ top: HEADER_HEIGHT, height: "fit-content" }}
        >
          <div className="mb-3 text-xs font-semibold text-muted-foreground">Navigation</div>
          <SideNav />
        </aside>

        <main className="flex-1 w-full overflow-auto">
          <div className="w-full px-6 py-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}