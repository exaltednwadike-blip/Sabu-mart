import { Search, ChevronDown, Menu, Heart, ShoppingBag, User, Bell, LayoutDashboard, Store, LogOut, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { getCurrentUser, getProfile, signOut } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { getCartCount } from "@/lib/cart";
import { getWishlistCount } from "@/lib/wishlist";
import { getCategories, type ListingCategory } from "@/lib/products";

const MAIN_NAV_COUNT = 6;

export function SiteHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checked, setChecked] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [categories, setCategories] = useState<ListingCategory[]>([]);

  useEffect(function () {
    getCategories()
      .then(setCategories)
      .catch(function () {
        setCategories([]);
      });
  }, []);

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (user) {
        getProfile(user.id)
          .then(function (profile) {
            setFullName(profile.full_name ?? user.email ?? "Account");
            setIsSeller(!!profile.is_seller);
          })
          .catch(function () {
            setFullName(user.email ?? "Account");
          });
        isAdmin(user.id).then(function (admin) {
          setIsAdminUser(admin);
        });
        getCartCount(user.id).then(setCartCount);
        getWishlistCount(user.id).then(setWishCount);
      }
      setChecked(true);
    });
  }, []);

  function handleSignOut() {
    signOut().then(function () {
      setFullName(null);
      setIsSeller(false);
      setIsAdminUser(false);
      setAccountOpen(false);
      navigate({ to: "/" });
    });
  }

  function handleMobileSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = mobileQuery.trim();
    if (!trimmed) return;
    setOpen(false);
    navigate({ to: "/search", search: { q: trimmed } });
  }

  const loggedIn = checked && !!fullName;

  function renderNavLink(cat: ListingCategory) {
    return (
      <Link
        key={cat.id}
        to="/category/$categoryId"
        params={{ categoryId: cat.id }}
        className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
      >
        {cat.name}
      </Link>
    );
  }

  function renderMoreLink(cat: ListingCategory) {
    return (
      <Link
        key={cat.id}
        to="/category/$categoryId"
        params={{ categoryId: cat.id }}
        className="rounded-lg px-2 py-1.5 text-xs hover:bg-accent"
      >
        {cat.name}
      </Link>
    );
  }

  function renderMobileLink(cat: ListingCategory) {
    return (
      <Link
        key={cat.id}
        to="/category/$categoryId"
        params={{ categoryId: cat.id }}
        onClick={function () { setOpen(false); }}
        className="rounded-lg px-3 py-2 text-sm hover:bg-accent"
      >
        {cat.name}
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="hidden bg-primary py-1.5 text-center text-xs font-medium text-primary-foreground md:block">
        Free delivery on orders over ₦25,000 · Sell on SABU from just ₦500 per listing
      </div>
      <div className="glass border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6">
          <Logo />

          <nav className="ml-auto flex items-center gap-1">
            <Link to={loggedIn ? "/buyer/wishlist" : "/login"} className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-accent-orange-foreground">
                  {wishCount}
                </span>
              ) : null}
            </Link>
            <IconBtn icon={<Bell className="h-5 w-5" />} label="Alerts" badge="3" />
            <Link to={loggedIn ? "/buyer/cart" : "/login"} className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-accent-orange-foreground">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {isSeller ? (
              <Link
                to="/seller"
                className="hidden items-center gap-1.5 rounded-xl bg-accent-orange px-4 py-2 text-sm font-semibold text-accent-orange-foreground shadow-orange transition hover:opacity-90 md:inline-flex"
              >
                <Store className="h-4 w-4" /> Sell
              </Link>
            ) : null}

            {!checked ? null : loggedIn ? (
              <div className="relative hidden md:block">
                <button
                  onClick={function () { setAccountOpen(!accountOpen); }}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <LayoutDashboard className="h-4 w-4" /> {fullName}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {accountOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-popover p-1 shadow-elegant">
                    <Link
                      to="/buyer"
                      onClick={function () { setAccountOpen(false); }}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    {isAdminUser ? (
                      <Link
                        to="/admin"
                        onClick={function () { setAccountOpen(false); }}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                      >
                        <ShieldCheck className="h-4 w-4" /> Admin
                      </Link>
                    ) : null}
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-accent md:inline-flex"
              >
                <User className="h-4 w-4" /> Sign in
              </Link>
            )}

            <button
              className="rounded-lg border border-border p-2 md:hidden"
              onClick={function () { setOpen(!open); }}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </nav>
        </div>

        <div className="mx-auto hidden max-w-7xl items-center gap-1 overflow-x-auto px-4 pb-3 no-scrollbar md:flex">
          <Link to="/" className="whitespace-nowrap rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">Home</Link>
          {categories.slice(0, MAIN_NAV_COUNT).map(renderNavLink)}
          {categories.length > MAIN_NAV_COUNT ? (
            <div className="group relative">
              <button className="flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">
                More <ChevronDown className="h-3 w-3" />
              </button>
              <div className="invisible absolute right-0 top-full z-50 mt-1 grid w-64 grid-cols-2 gap-1 rounded-xl border border-border bg-popover p-2 opacity-0 shadow-elegant transition group-hover:visible group-hover:opacity-100">
                {categories.slice(MAIN_NAV_COUNT).map(renderMoreLink)}
              </div>
            </div>
          ) : null}
        </div>

        {open ? (
          <div className="border-t border-border bg-background px-4 py-3 md:hidden">
            <form className="flex items-center rounded-xl border border-border bg-background" onSubmit={handleMobileSearch}>
              <Search className="ml-3 h-4 w-4 text-muted-foreground" />
              <input
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                placeholder="Search SABU..."
              />
            </form>
            <div className="mt-3 grid grid-cols-2 gap-1">
              {categories.map(renderMobileLink)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {loggedIn ? (
                <>
                  <Link to="/buyer" className="rounded-xl border border-border py-2 text-center text-sm font-medium">Dashboard</Link>
                  <Link to="/buyer/cart" className="rounded-xl border border-border py-2 text-center text-sm font-medium">Cart ({cartCount})</Link>
                  {isAdminUser ? (
                    <Link to="/admin" className="rounded-xl border border-border py-2 text-center text-sm font-medium">Admin</Link>
                  ) : null}
                  <button onClick={handleSignOut} className="rounded-xl bg-destructive py-2 text-center text-sm font-semibold text-destructive-foreground">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-xl border border-border py-2 text-center text-sm font-medium">Sign in</Link>
                  <Link to="/signup" className="rounded-xl bg-accent-orange py-2 text-center text-sm font-semibold text-accent-orange-foreground">Sign up</Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function IconBtn(props: { icon: React.ReactNode; label: string; badge?: string }) {
  return (
    <button aria-label={props.label} className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground">
      {props.icon}
      {props.badge ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-accent-orange-foreground">
          {props.badge}
        </span>
      ) : null}
    </button>
  );
}
