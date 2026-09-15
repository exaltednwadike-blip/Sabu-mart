import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Utensils, Plus, Trash2, PencilLine, Check, X, ImageOff } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createRestaurant, getMenuItems, getRestaurants, toggleRestaurantOpen, deleteRestaurant } from "@/lib/food";
import { Toaster, toast } from "sonner";

export const Route = createFileRoute("/admin/restaurants")({
  component: AdminRestaurants,
});

const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

interface MenuRow {
  id: string;
  name: string;
  price: string;
  description: string;
  media: File | null;
}

function AdminRestaurants() {
  const [activeTab, setActiveTab] = useState<"all" | "create">("all");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState(STATES[0]);
  const [area, setArea] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [menuItems, setMenuItems] = useState<MenuRow[]>([
    { id: "initial", name: "", price: "", description: "", media: null },
  ]);

  function loadRestaurants() {
    setLoading(true);
    getRestaurants()
      .then(function (items) {
        return Promise.all(items.map(function (restaurant: any) {
          return getMenuItems(restaurant.id).then(function (menu) {
            return { ...restaurant, itemCount: menu.length };
          });
        }));
      })
      .then(function (data) {
        setRestaurants(data);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(function () {
    loadRestaurants();
  }, []);

  function addMenuRow() {
    setMenuItems(function (prev) {
      return [...prev, { id: Date.now().toString() + Math.random().toString(36).slice(2), name: "", price: "", description: "", media: null }];
    });
  }

  function updateMenuRow(rowId: string, field: keyof Omit<MenuRow, "id" | "media"> | "media", value: string | File | null) {
    setMenuItems(function (prev) {
      return prev.map(function (row) {
        if (row.id !== rowId) return row;
        return { ...row, [field]: value } as MenuRow;
      });
    });
  }

  function removeMenuRow(rowId: string) {
    setMenuItems(function (prev) {
      if (prev.length === 1) return prev;
      return prev.filter(function (row) { return row.id !== rowId; });
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const cleanItems = menuItems.filter(function (row) {
      return row.name.trim() || row.description.trim() || row.price || row.media;
    });
    if (!name.trim() || !state || !area.trim() || !cuisine.trim() || cleanItems.length === 0) {
      toast.error("Please fill in the restaurant info and add at least one menu item.");
      return;
    }

    getCurrentUser().then(function (user) {
      if (!user) {
        toast.error("Please sign in to create a restaurant.");
        return;
      }
      setCreating(true);
      return createRestaurant({
        name: name.trim(),
        state,
        area: area.trim(),
        description: description.trim(),
        cuisine: cuisine.trim(),
        coverImage,
        createdBy: user.id,
        menuItems: cleanItems.map(function (row) {
          return {
            name: row.name.trim(),
            price: Number(row.price) || 0,
            description: row.description.trim(),
            media: row.media,
          };
        }),
      });
    })
      .then(function (restaurant) {
        toast.success("Restaurant created successfully.");
        setActiveTab("all");
        setName("");
        setState(STATES[0]);
        setArea("");
        setCuisine("");
        setDescription("");
        setCoverImage(null);
        setMenuItems([{ id: "initial", name: "", price: "", description: "", media: null }]);
        if (restaurant) {
          loadRestaurants();
        }
      })
      .catch(function (err) {
        toast.error(err instanceof Error ? err.message : "Could not create restaurant.");
      })
      .finally(function () {
        setCreating(false);
      });
  }

  function handleDelete(id: string) {
    deleteRestaurant(id)
      .then(function () {
        toast.success("Restaurant removed.");
        setRestaurants(function (prev) {
          return prev.filter(function (restaurant) { return restaurant.id !== id; });
        });
      })
      .catch(function (err) {
        toast.error(err instanceof Error ? err.message : "Could not delete restaurant.");
      });
  }

  function handleToggle(restaurant: any) {
    toggleRestaurantOpen(restaurant.id, !restaurant.is_open)
      .then(function () {
        setRestaurants(function (prev) {
          return prev.map(function (item) {
            if (item.id === restaurant.id) {
              return { ...item, is_open: !restaurant.is_open };
            }
            return item;
          });
        });
      })
      .catch(function (err) {
        toast.error(err instanceof Error ? err.message : "Could not update restaurant status.");
      });
  }

  function fillEditForm(restaurant: any) {
    setActiveTab("create");
    setName(restaurant.name);
    setState(restaurant.state || STATES[0]);
    setArea(restaurant.area || "");
    setCuisine(restaurant.cuisine || "");
    setDescription(restaurant.description || "");
    setMenuItems(
      [{ id: "initial", name: "", price: "", description: "", media: null }],
    );
    toast.info("Edit mode is ready. Update the values and save to make changes. ");
  }

  const totalMenuItems = useMemo(function () {
    return restaurants.reduce(function (sum, restaurant) {
      return sum + (restaurant.itemCount || 0);
    }, 0);
  }, [restaurants]);

  return (
    <div>
      <Toaster position="top-right" richColors />
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Utensils className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Restaurant management</h1>
          <p className="text-sm text-muted-foreground">Create food venues, manage menu items, and control open/closed status.</p>
        </div>
      </div>

      <div className="mb-6 inline-flex rounded-xl border border-border bg-card p-1 shadow-soft">
        <button
          type="button"
          onClick={function () { setActiveTab("all"); }}
          className={"rounded-lg px-3 py-2 text-sm font-medium " + (activeTab === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
        >
          All restaurants
        </button>
        <button
          type="button"
          onClick={function () { setActiveTab("create"); }}
          className={"rounded-lg px-3 py-2 text-sm font-medium " + (activeTab === "create" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
        >
          Create restaurant
        </button>
      </div>

      {activeTab === "all" ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total restaurants</span>
              <span className="font-semibold text-foreground">{restaurants.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Menu items tracked</span>
              <span className="font-semibold text-foreground">{totalMenuItems}</span>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : restaurants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No restaurants yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Cuisine</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Items</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map(function (restaurant) {
                      return (
                        <tr key={restaurant.id} className="border-t border-border">
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{restaurant.name}</div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {restaurant.area || "-"}, {restaurant.state}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{restaurant.cuisine || "-"}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={function () { handleToggle(restaurant); }}
                              className={"inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold " + (restaurant.is_open ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}
                            >
                              {restaurant.is_open ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                              {restaurant.is_open ? "Open" : "Closed"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{restaurant.itemCount || 0}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={function () { fillEditForm(restaurant); }}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
                              >
                                <PencilLine className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={function () { handleDelete(restaurant.id); }}
                                className="inline-flex items-center gap-1 rounded-lg border border-destructive px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleCreate} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Restaurant name</span>
                <input
                  value={name}
                  onChange={function (e) { setName(e.target.value); }}
                  placeholder="e.g. Bungalow Grill"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">State</span>
                <select
                  value={state}
                  onChange={function (e) { setState(e.target.value); }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                  {STATES.map(function (option) {
                    return <option key={option} value={option}>{option}</option>;
                  })}
                </select>
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Area</span>
                <input
                  value={area}
                  onChange={function (e) { setArea(e.target.value); }}
                  placeholder="e.g. Lekki Phase 1"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Cuisine</span>
                <input
                  value={cuisine}
                  onChange={function (e) { setCuisine(e.target.value); }}
                  placeholder="e.g. Nigerian, Pizza"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm">
              <span className="font-medium text-foreground">Description</span>
              <textarea
                rows={4}
                value={description}
                onChange={function (e) { setDescription(e.target.value); }}
                placeholder="Describe the restaurant, vibe, and what they serve."
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Cover image</label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground hover:border-primary/50">
                <Plus className="h-4 w-4" />
                {coverImage ? coverImage.name : "Upload cover image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={function (e) { setCoverImage(e.target.files && e.target.files[0] ? e.target.files[0] : null); }}
                />
              </label>
              {coverImage ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  <img src={URL.createObjectURL(coverImage)} alt="Cover preview" className="h-36 w-full object-cover" />
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Menu items</h3>
                <button
                  type="button"
                  onClick={addMenuRow}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  <Plus className="h-3.5 w-3.5" /> Add item
                </button>
              </div>

              {menuItems.map(function (row, index) {
                return (
                  <div key={row.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Item {index + 1}</span>
                      {menuItems.length > 1 ? (
                        <button
                          type="button"
                          onClick={function () { removeMenuRow(row.id); }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-2 text-sm">
                        <span>Name</span>
                        <input
                          value={row.name}
                          onChange={function (e) { updateMenuRow(row.id, "name", e.target.value); }}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                      </label>
                      <label className="space-y-2 text-sm">
                        <span>Price (₦)</span>
                        <input
                          type="number"
                          min="0"
                          value={row.price}
                          onChange={function (e) { updateMenuRow(row.id, "price", e.target.value); }}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                      </label>
                    </div>
                    <label className="mt-3 block space-y-2 text-sm">
                      <span>Description</span>
                      <textarea
                        rows={2}
                        value={row.description}
                        onChange={function (e) { updateMenuRow(row.id, "description", e.target.value); }}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="mt-3 block space-y-2 text-sm">
                      <span>Image or video</span>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground hover:border-primary/50">
                        <ImageOff className="h-3.5 w-3.5" />
                        {row.media ? row.media.name : "Choose file"}
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={function (e) {
                            const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                            updateMenuRow(row.id, "media", file);
                          }}
                        />
                      </label>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="font-semibold text-foreground">Restaurant summary</h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between"><span>Name</span><span className="font-medium text-foreground">{name || "Not set"}</span></div>
              <div className="flex items-center justify-between"><span>State</span><span className="font-medium text-foreground">{state}</span></div>
              <div className="flex items-center justify-between"><span>Area</span><span className="font-medium text-foreground">{area || "-"}</span></div>
              <div className="flex items-center justify-between"><span>Cuisine</span><span className="font-medium text-foreground">{cuisine || "-"}</span></div>
              <div className="flex items-center justify-between"><span>Items</span><span className="font-medium text-foreground">{menuItems.filter(function (row) { return row.name.trim() || row.price || row.description.trim() || row.media; }).length}</span></div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {creating ? "Creating..." : "Create restaurant"}
            </button>
          </aside>
        </form>
      )}
    </div>
  );
}
