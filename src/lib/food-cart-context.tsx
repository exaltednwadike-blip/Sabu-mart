import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { FoodCartItem } from "@/lib/food";

export interface FoodCartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: FoodCartItem[];
}

interface FoodCartContextValue {
  cart: FoodCartState;
  addItem: (restaurantId: string, restaurantName: string, menuItem: { id: string; name: string; price: number }) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const STORAGE_KEY = "sabu_food_cart";
const defaultCart: FoodCartState = { restaurantId: null, restaurantName: null, items: [] };

const FoodCartContext = createContext<FoodCartContextValue | undefined>(undefined);

function readStoredCart() {
  if (typeof window === "undefined") return defaultCart;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCart;
    const parsed = JSON.parse(raw) as FoodCartState;
    if (!parsed || !Array.isArray(parsed.items)) return defaultCart;
    return parsed;
  } catch (error) {
    return defaultCart;
  }
}

export function FoodCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<FoodCartState>(readStoredCart);

  useEffect(function () {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  function addItem(restaurantId: string, restaurantName: string, menuItem: { id: string; name: string; price: number }) {
    setCart(function (prev) {
      const nextCart = { ...prev };
      if (prev.restaurantId && prev.restaurantId !== restaurantId) {
        const shouldSwitch = window.confirm("Starting an order from a new restaurant will clear your current order. Continue?");
        if (!shouldSwitch) {
          return prev;
        }
        nextCart.restaurantId = null;
        nextCart.restaurantName = null;
        nextCart.items = [];
      }

      if (!nextCart.restaurantId) {
        nextCart.restaurantId = restaurantId;
        nextCart.restaurantName = restaurantName;
      }

      const existingIndex = nextCart.items.findIndex(function (item) {
        return item.menuItemId === menuItem.id;
      });

      if (existingIndex >= 0) {
        nextCart.items = nextCart.items.map(function (item, index) {
          if (index === existingIndex) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
        return nextCart;
      }

      nextCart.items = [
        ...nextCart.items,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
        },
      ];

      return nextCart;
    });
  }

  function removeItem(menuItemId: string) {
    setCart(function (prev) {
      const nextItems = prev.items.filter(function (item) {
        return item.menuItemId !== menuItemId;
      });
      const nextCart = { ...prev, items: nextItems };
      if (nextCart.items.length === 0) {
        nextCart.restaurantId = null;
        nextCart.restaurantName = null;
      }
      return nextCart;
    });
  }

  function updateQuantity(menuItemId: string, qty: number) {
    setCart(function (prev) {
      if (qty <= 0) {
        return { ...prev, items: prev.items.filter(function (item) { return item.menuItemId !== menuItemId; }) };
      }

      const nextItems = prev.items.map(function (item) {
        if (item.menuItemId === menuItemId) {
          return { ...item, quantity: qty };
        }
        return item;
      });

      return { ...prev, items: nextItems };
    });
  }

  function clearCart() {
    setCart(defaultCart);
  }

  const itemCount = useMemo(function () {
    return cart.items.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
  }, [cart.items]);

  const subtotal = useMemo(function () {
    return cart.items.reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);
  }, [cart.items]);

  const value = useMemo(function () {
    return { cart, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal };
  }, [cart, itemCount, subtotal]);

  return <FoodCartContext.Provider value={value}>{children}</FoodCartContext.Provider>;
}

export function useFoodCart() {
  const context = useContext(FoodCartContext);
  if (!context) {
    throw new Error("useFoodCart must be used within a FoodCartProvider");
  }
  return context;
}
