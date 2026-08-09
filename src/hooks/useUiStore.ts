/**
 * Tiny module-level UI store shared across ecommerce components.
 * Uses useSyncExternalStore — no external dependencies.
 * Persists cart / wishlist / compare to localStorage.
 */
import { useSyncExternalStore } from "react";
import type { Product } from "@/types/product";

type OverlayKey = "search" | "miniCart" | "compare" | "quickView";

interface CartLine {
  productId: string;
  product: Product;
  quantity: number;
}

interface UiState {
  cart: CartLine[];
  compare: Product[];
  wishlist: string[];
  overlays: Record<OverlayKey, boolean>;
  quickViewProduct: Product | null;
}

const STORAGE_KEY = "ba-medical-ui-v1";
const MAX_COMPARE = 4;

const isBrowser = typeof window !== "undefined";

function load(): UiState {
  const empty: UiState = {
    cart: [],
    compare: [],
    wishlist: [],
    overlays: { search: false, miniCart: false, compare: false, quickView: false },
    quickViewProduct: null,
  };
  if (!isBrowser) return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<UiState>;
    return {
      ...empty,
      cart: parsed.cart ?? [],
      compare: parsed.compare ?? [],
      wishlist: parsed.wishlist ?? [],
    };
  } catch {
    return empty;
  }
}

let state: UiState = {
  cart: [],
  compare: [],
  wishlist: [],
  overlays: { search: false, miniCart: false, compare: false, quickView: false },
  quickViewProduct: null,
};

const listeners = new Set<() => void>();
let hydrated = false;

function persist() {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cart: state.cart, compare: state.compare, wishlist: state.wishlist }),
    );
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function setState(next: Partial<UiState>) {
  state = { ...state, ...next };
  persist();
  emit();
}

function subscribe(listener: () => void) {
  if (!hydrated && isBrowser) {
    state = load();
    hydrated = true;
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}
function getServerSnapshot() {
  return state;
}

export function useUiStore<T>(selector: (s: UiState) => T): T {
  const snap = useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
  return snap;
}

// -------- Actions --------

export const uiActions = {
  openOverlay(key: OverlayKey) {
    setState({ overlays: { ...state.overlays, [key]: true } });
  },
  closeOverlay(key: OverlayKey) {
    setState({ overlays: { ...state.overlays, [key]: false } });
  },
  toggleOverlay(key: OverlayKey) {
    setState({ overlays: { ...state.overlays, [key]: !state.overlays[key] } });
  },

  addToCart(product: Product, quantity = 1) {
    const existing = state.cart.find((l) => l.productId === product.id);
    const cart = existing
      ? state.cart.map((l) =>
          l.productId === product.id ? { ...l, quantity: l.quantity + quantity } : l,
        )
      : [...state.cart, { productId: product.id, product, quantity }];
    setState({ cart, overlays: { ...state.overlays, miniCart: true } });
  },
  updateCartQty(productId: string, quantity: number) {
    const cart =
      quantity <= 0
        ? state.cart.filter((l) => l.productId !== productId)
        : state.cart.map((l) => (l.productId === productId ? { ...l, quantity } : l));
    setState({ cart });
  },
  removeFromCart(productId: string) {
    setState({ cart: state.cart.filter((l) => l.productId !== productId) });
  },
  clearCart() {
    setState({ cart: [] });
  },

  toggleWishlist(productId: string) {
    const active = state.wishlist.includes(productId);
    setState({
      wishlist: active
        ? state.wishlist.filter((id) => id !== productId)
        : [...state.wishlist, productId],
    });
    return !active;
  },

  toggleCompare(product: Product) {
    const active = state.compare.some((p) => p.id === product.id);
    if (active) {
      setState({ compare: state.compare.filter((p) => p.id !== product.id) });
      return false;
    }
    if (state.compare.length >= MAX_COMPARE) return false;
    setState({
      compare: [...state.compare, product],
      overlays: { ...state.overlays, compare: true },
    });
    return true;
  },
  clearCompare() {
    setState({ compare: [] });
  },

  openQuickView(product: Product) {
    setState({
      quickViewProduct: product,
      overlays: { ...state.overlays, quickView: true },
    });
  },
  closeQuickView() {
    setState({
      overlays: { ...state.overlays, quickView: false },
      quickViewProduct: null,
    });
  },
};

// Selectors
export const selectors = {
  cartCount: (s: UiState) => s.cart.reduce((sum, l) => sum + l.quantity, 0),
  cartSubtotalMinor: (s: UiState) =>
    s.cart.reduce((sum, l) => sum + l.product.price.amount * l.quantity, 0),
  compareCount: (s: UiState) => s.compare.length,
  isInCompare: (id: string) => (s: UiState) => s.compare.some((p) => p.id === id),
  isInWishlist: (id: string) => (s: UiState) => s.wishlist.includes(id),
  MAX_COMPARE: () => MAX_COMPARE,
};

export const COMPARE_LIMIT = MAX_COMPARE;
