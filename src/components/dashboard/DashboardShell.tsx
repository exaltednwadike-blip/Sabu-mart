import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Search, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { adminSearch } from "@/lib/admin";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/brand/Logo";

export type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export function DashboardShell({
  groups,
  role,
  userName,
  userMeta,
  children,
}: {
  groups: NavGroup[];
  role: "Seller" | "Buyer" | "Admin";
  userName: string;
  userMeta: string;
  children: ReactNode;
}) {
  const [adminQuery, setAdminQuery] = useState("");
  const [adminResults, setAdminResults] = useState<{ products: any[]; sellers: any[] } | null>(null);

  function handleAdminSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!adminQuery.trim()) {
      setAdminResults(null);
      return;
    }
    adminSearch(adminQuery).then(setAdminResults);
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <DashboardSidebar groups={groups} role={role} userName={userName} userMeta={userMeta} />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            {role === "Admin" ? (
              <form onSubmit={handleAdminSearch} className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 md:max-w-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={adminQuery}
                  onChange={function (e) { setAdminQuery(e.target.value); }}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search products or sellers..."
                />
              </form>
            ) : (
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 md:max-w-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={role === "Seller" ? "Search products, orders..." : "Search your orders..."}
                />
              </div>
            )}
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Alerts">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent-orange" />
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Exit to marketplace</span>
            </Link>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {role === "Admin" && adminResults ? (
              <div className="mb-6 space-y-3">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <h3 className="text-sm font-semibold">Products ({adminResults.products.length})</h3>
                  {adminResults.products.length === 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">No matching products.</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm">
                      {adminResults.products.map(function (p: any) {
                        return <li key={p.id}>{p.title} <span className="text-xs text-muted-foreground">({p.status})</span></li>;
                      })}
                    </ul>
                  )}
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <h3 className="text-sm font-semibold">Sellers ({adminResults.sellers.length})</h3>
                  {adminResults.sellers.length === 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">No matching sellers.</p>
                  ) : (
                    <ul className="mt-2 space-y-1 text-sm">
                      {adminResults.sellers.map(function (s: any) {
                        return <li key={s.id}>{s.store_name}</li>;
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function DashboardSidebar({
  groups,
  role,
  userName,
  userMeta,
}: {
  groups: NavGroup[];
  role: "Seller" | "Buyer" | "Admin";
  userName: string;
  userMeta: string;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-1">
          <Logo />
        </div>
        <div className="mt-1 rounded-lg bg-sidebar-accent/60 px-2 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-brand font-display font-bold text-primary-foreground">
              {userName[0]}
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <div className="truncate text-sm font-semibold">{userName}</div>
              <div className="truncate text-[11px] text-muted-foreground">{userMeta}</div>
            </div>
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary group-data-[collapsible=icon]:hidden">
              {role}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="rounded-full bg-accent-orange px-1.5 text-[10px] font-bold text-accent-orange-foreground">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="rounded-lg bg-primary/5 p-3 text-xs group-data-[collapsible=icon]:hidden">
          <div className="font-semibold text-primary">Need help?</div>
          <div className="mt-0.5 text-muted-foreground">Chat with SABU Assistant 24/7.</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  tint = "primary",
}: {
  label: string;
  value: string;
  trend?: string;
  icon: React.ComponentType<{ className?: string }>;
  tint?: "primary" | "orange" | "success";
}) {
  const tintClass =
    tint === "primary"
      ? "bg-primary/10 text-primary"
      : tint === "orange"
      ? "bg-accent-orange/15 text-accent-orange"
      : "bg-success/15 text-success";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tintClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4 font-display text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
