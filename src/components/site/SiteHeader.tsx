import { Search, MapPin, ChevronDown, Menu, Heart, ShoppingBag, User, Bell, LayoutDashboard, Store, LogOut, ShieldCheck, Check, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { getCurrentUser, getProfile, signOut } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { getCartCount } from "@/lib/cart";
import { getWishlistCount } from "@/lib/wishlist";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/lib/notifications";

const MAIN_NAV = [
  "Marketplace", "Accommodation", "Vehicles", "Electronics",
  "Fashion", "Agriculture", "Food", "Jobs", "Services", "Properties",
];

const MORE_NAV = [
  "Phones", "Computers", "Beauty", "Health", "Furniture",
  "Construction", "Industrial", "Events", "Education", "Sports", "Travel",
];

export function SiteHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checked, setChecked] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishCount, setWishCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(function () {
    getCurrentUser().then(function (user) {
      if (user) {
        setUserId(user.id);
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
        getUnreadCount(user.id).then(setUnreadCount);
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

  function openNotifications() {
    setNotifOpen(!notifOpen);
    if (!notifOpen && userId) {
      getNotifications(userId, 10).then(setNotifications);
    }
  }

  function handleNotifClick(n: any) {
    if (!n.read) {
      markAsRead(n.id).then(function () {
        setUnreadCount(function (c) { return Math.max(0, c - 1); });
      });
    }
    setNotifOpen(false);
    if (n.link) navigate({ to: n.link });
  }

  function handleMarkAllRead() {
    if (!userId) return;
    markAllAsRead(userId).then(function () {
      setUnreadCount(0);
      setNotifications(function (prev) {
        return prev.map(function (n: any) { return { ...n, read: true }; });
      });
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate({ to: "/search", search: { q: trimmed } });
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    return Math.floor(hrs / 24) + "d ago";
  }

  function renderNotification(n: any) {
    return (
      <button
        key={n.id}
        onClick={function () { handleNotifClick(n); }}
        className={"flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left hover:bg-accent " + (n.read ? "" : "bg-primary/5")}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span className="text-sm font-medium">{n.title}</span>
          {!n.read ? <span className="h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
        </div>
        {n.message ? <span className="text-xs text-muted-foreground">{n.message}</span> : null}
        <span className="text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</span>
      </button>
    );
  }

  function renderNavLink(item: string) {
    return (
      <a key={item} href={"#" + item.toLowerCase()} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">
        {item}
      </a>
    );
  }

  function renderMoreLink(m: string) {
    return (
      <a key={m} href={"#" + m.toLowerCase()} className="rounded-lg px-2 py-1.5 text-xs hover:bg-accent">
        {m}
      </a>
    );
  }

  function renderMobileLink(item: string) {
    return (
      <a key={item} href={"#" + item.toLowerCase()} className="rounded-lg px-3 py-2 text-sm hover:bg-accent">
        {item}
      </a>
    );
  }

  const loggedIn = checked && !!fullName;

  return (
    <header className="sticky top-0 z-40 w-full">
      {!checked ? null : loggedIn ? (
        <div className="hidden bg-primary py-1.5 text-center text-xs font-medium text-primary-foreground md:block">
          Free delivery on orders over ₦25,000 · Sell on SABU for free — limited launch offer
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground">
          <span>New to SABU?</span>
          <Link to="/signup" className="underline underline-offset-2">Sign up to start buying</Link>
          <span className="opacity-60">or</span>
          <Link to="/signup" className="underline underline-offset-2">become a seller — free</Link>
        </div>
      )}
      <div className="glass border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6">
          <Logo />

          {loggedIn ? (
            <div className="hidden flex-1 items-center gap-2 md:flex">
              <div className="flex flex-1 items-center rounded-xl border border-border bg-background/70 shadow-soft">
                <div className="hidden items-center gap-1 border-r border-border px-3 py-2.5 text-sm text-muted-foreground lg:flex">
                  <MapPin className="h-4 w-4 text-primary" />
                  Lagos
                  <ChevronDown className="h-3.5 w-3.5" />
                </div>
                <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center">
                  <input
                    value={query}
                    onChange={function (e) { setQuery(e.target.value); }}
                    className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Search products, brands, categories..."
                  />
                  <button type="submit" className="m-1 flex items-center gap-2 rounded-lg gradient-brand px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90">
                    <Search className="h-4 w-4" /> Search
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <nav className="ml-auto flex items-center gap-1">
            {loggedIn ? (
              <Link to="/buyer/wishlist" className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {wishCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-accent-orange-foreground">
                    {wishCount}
                  </span>
                ) : null}
              </Link>
            ) : null}

            {loggedIn ? (
              <div className="relative">
                <button
                  onClick={openNotifications}
                  className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-accent-orange-foreground">
                      {unreadCount}
                    </span>
                  ) : null}
                </button>
                {notifOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-border bg-popover p-1 shadow-elegant">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm font-semibold">Notifications</span>
                      {unreadCount > 0 ? (
                        <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          <Check className="h-3 w-3" /> Mark all read
                        </button>
                      ) : null}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-3 py-6 text-center text-xs text-muted-foreground">No notifications yet.</p>
                      ) : (
                        notifications.map(renderNotification)
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {loggedIn ? (
              <Link to="/buyer/cart" className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-accent-orange-foreground">
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            ) : null}

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
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <User className="h-4 w-4" /> Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-xl gradient-brand px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-95"
                >
                  <UserPlus className="h-4 w-4" /> Sign up
                </Link>
              </div>
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

        {loggedIn ? (
          <div className="border-t border-border bg-background px-4 py-2.5 md:hidden">
            <form onSubmit={handleSearchSubmit} className="flex items-center rounded-xl border border-border bg-background">
              <Search className="ml-3 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={function (e) { setQuery(e.target.value); }}
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                placeholder="Search SABU..."
              />
            </form>
          </div>
        ) : null}

        {loggedIn ? (
          <div className="mx-auto hidden max-w-7xl items-center gap-1 overflow-x-auto px-4 pb-3 no-scrollbar md:flex">
            <a href="/" className="whitespace-nowrap rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">Home</a>
            {MAIN_NAV.map(renderNavLink)}
            <div className="group relative">
              <button className="flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground">
                More <ChevronDown className="h-3 w-3" />
              </button>
              <div className="invisible absolute right-0 top-full z-50 mt-1 grid w-64 grid-cols-2 gap-1 rounded-xl border border-border bg-popover p-2 opacity-0 shadow-elegant transition group-hover:visible group-hover:opacity-100">
                {MORE_NAV.map(renderMoreLink)}
              </div>
            </div>
          </div>
        ) : null}

        {open ? (
          <div className="border-t border-border bg-background px-4 py-3 md:hidden">
            {loggedIn ? (
              <div className="mt-3 grid grid-cols-2 gap-1">
                {[...MAIN_NAV, ...MORE_NAV].map(renderMobileLink)}
              </div>
            ) : null}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {loggedIn ? (
                <>
                  {isSeller ? (
                    <Link
                      to="/seller"
                      className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl bg-accent-orange py-2 text-center text-sm font-semibold text-accent-orange-foreground"
                    >
                      <Store className="h-4 w-4" /> Sell / Seller dashboard
                    </Link>
                  ) : null}
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
