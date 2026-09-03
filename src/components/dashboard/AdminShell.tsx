import { Link, useRouterState } from "@tanstack/react-router";
import { ShieldCheck, Users, Package, LogOut, LayoutDashboard, Ticket } from "lucide-react";
import { signOut } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

const NAV_ITEMS = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Sellers", url: "/admin/sellers", icon: Users },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Support", url: "/admin/support", icon: Ticket },
];

export function AdminShell(props: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

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
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
          (active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")
        }
      >
        <Icon className="h-4 w-4" />
        {item.title}
      </Link>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="font-display text-sm font-bold leading-none">SABU Admin</div>
            <div className="text-[10px] text-muted-foreground">Control panel</div>
          </div>
          <div className="ml-auto hidden md:block">
            <Link to="/" className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-accent">Back to home</Link>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {NAV_ITEMS.map(renderNavItem)}
        </nav>
        <div className="absolute bottom-4 left-3 w-56">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur md:hidden">
          <div className="font-display text-sm font-bold">SABU Admin</div>
        </header>
        <div className="border-b border-border bg-background px-4 py-2 md:hidden">
          <nav className="flex gap-2 overflow-x-auto">
            {NAV_ITEMS.map(renderNavItem)}
          </nav>
        </div>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            {props.children}
          </div>
        </main>
      </div>
    </div>
  );
}
