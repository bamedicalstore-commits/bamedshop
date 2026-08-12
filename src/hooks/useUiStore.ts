/**
 * Tiny module-level UI store shared across ecommerce components.
 * Uses useSyncExternalStore — no external dependencies.
 * Persists wishlist / compare to localStorage.
 */
import { useSyncExternalStore } from "react";
import type { Product } from "@/types/product";

type OverlayKey = "search" | "miniCart" | "compare" | "quickView";

interface UiState {
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
      compare: parsed.compare ?? [],
      wishlist: parsed.wishlist ?? [],
    };
  } catch {
    return empty;
  }
}

let state: UiState = {
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
      JSON.stringify({ compare: state.compare, wishlist: state.wishlist }),
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
  compareCount: (s: UiState) => s.compare.length,
  isInCompare: (id: string) => (s: UiState) => s.compare.some((p) => p.id === id),
  isInWishlist: (id: string) => (s: UiState) => s.wishlist.includes(id),
  MAX_COMPARE: () => MAX_COMPARE,
};

export const COMPARE_LIMIT = MAX_COMPARE;
