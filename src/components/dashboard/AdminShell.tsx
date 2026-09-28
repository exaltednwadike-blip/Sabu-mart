import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Users, Package, LogOut, LayoutDashboard, Banknote, AlertTriangle, Utensils, ShoppingBag, Search, BarChart3 } from "lucide-react";
import { useState } from "react";
import { signOut } from "@/lib/auth";
import { adminSearch } from "@/lib/admin";

const NAV_GROUPS = [
  {
    label: "General",
    items: [
      { title: "Overview", url: "/admin", icon: LayoutDashboard },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Sellers", url: "/admin/sellers", icon: Users },
      { title: "Products", url: "/admin/products", icon: Package },
      { title: "Restaurants", url: "/admin/restaurants", icon: Utensils },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Food orders", url: "/admin/food-orders", icon: ShoppingBag },
      { title: "Withdrawals", url: "/admin/withdrawals", icon: Banknote },
      { title: "Disputes", url: "/admin/disputes", icon: AlertTriangle },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(function (g) { return g.items; });

export function AdminShell(props: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ products: any[]; sellers: any[] } | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      setResults(null);
      return;
    }
    adminSearch(query).then(setResults);
  }

  function handleSignOut() {
    signOut().then(function () {
      navigate({ to: "/" });
    });
  }

  function isActive(url: string) {
    if (url === "/admin") return currentPath === "/admin";
    return currentPath.indexOf(url) === 0;
  }

  function renderNavItem(item: any) {
    const active = isActive(item.url);
    const Icon = item.icon;
    return (
      <Link
        key={item.url}
        to={item.url}
        className={
          "flex items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 text-sm font-medium transition " +
          (active
            ? "border-primary bg-primary/10 text-primary"
            : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground")
        }
      >
        <Icon className="h-4 w-4" />
        {item.title}
      </Link>
    );
  }

  function renderGroup(group: any) {
    return (
      <div key={group.label} className="mb-5">
        <div className="px-3 pb-1.5 text-[10px] font-semibold text-muted-foreground/70">{group.label}</div>
        <div className="space-y-1">
          {group.items.map(renderNavItem)}
        </div>
      </div>
    );
  }

  const currentTitle = (ALL_NAV_ITEMS.find(function (i: any) { return isActive(i.url); }) || {}).title || "Admin";

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="font-display text-sm font-bold leading-none">SABU Admin</div>
            <div className="text-[10px] text-muted-foreground">Control panel</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {NAV_GROUPS.map(renderGroup)}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <div className="font-display text-sm font-bold md:hidden">SABU Admin</div>
          <div className="hidden text-sm font-semibold text-foreground md:block">{currentTitle}</div>
          <form onSubmit={handleSearch} className="ml-auto flex w-full max-w-xs items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={function (e) { setQuery(e.target.value); }}
              placeholder="Search products or sellers..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>
        </header>
        <div className="border-b border-border bg-background px-4 py-2 md:hidden">
          <nav className="flex gap-2 overflow-x-auto">
            {ALL_NAV_ITEMS.map(renderNavItem)}
          </nav>
        </div>
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            {results ? (
              <div className="mb-6 space-y-3">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <h3 className="text-sm font-semibold">Products ({results.products.length})</h3>
                  {results.products.length === 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">No matching products.</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm">
                      {results.products.map(function (p: any) {
                        return <li key={p.id}>{p.title} <span className="text-xs text-muted-foreground">({p.status})</span></li>;
                      })}
                    </ul>
                  )}
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <h3 className="text-sm font-semibold">Sellers ({results.sellers.length})</h3>
                  {results.sellers.length === 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">No matching sellers.</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm">
                      {results.sellers.map(function (s: any) {
                        return (
                          <li key={s.id}>
                            <Link to="/store/$sellerId" params={{ sellerId: s.id }} className="hover:underline">{s.store_name}</Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}
            {props.children}
          </div>
        </main>
      </div>
    </div>
  );
}
