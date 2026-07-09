import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Pill, Tag, Store, TrendingUp, Clock } from "lucide-react";
import { CATEGORIES, BRANDS, MOCK_PRODUCTS } from "@/constants/navigation";
import { uiActions, useUiStore } from "@/hooks/useUiStore";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

const RECENT_KEY = "ba-recent-searches-v1";

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveRecent(list: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
}

const TRENDING = ["Tensiomètre", "Oxymètre", "Stéthoscope Littmann", "Gants nitrile", "Thermomètre"];

export function SmartSearchTrigger({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => uiActions.openOverlay("search")}
      className={cn(
        "h-11 w-full max-w-2xl justify-start gap-3 rounded-md border-input bg-background px-3 text-muted-foreground shadow-none hover:bg-accent/50",
        className,
      )}
      aria-label="Rechercher — raccourci Ctrl K"
    >
      <Search className="size-4" aria-hidden="true" />
      <span className="flex-1 text-left text-sm">Rechercher un produit, une marque…</span>
      <kbd className="hidden items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}

export function SmartSearchIconTrigger() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Rechercher (Ctrl K)"
      onClick={() => uiActions.openOverlay("search")}
    >
      <Search />
    </Button>
  );
}

export function SmartSearch() {
  const open = useUiStore((s) => s.overlays.search);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRecent(loadRecent());
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        uiActions.toggleOverlay("search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { products: [], categories: [], brands: [] };
    return {
      products: MOCK_PRODUCTS.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
      ).slice(0, 6),
      categories: CATEGORIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4),
      brands: BRANDS.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 4),
    };
  }, [query]);

  const remember = (term: string) => {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 5);
    setRecent(next);
    saveRecent(next);
  };

  const go = (fn: () => void, term?: string) => {
    if (term) remember(term);
    uiActions.closeOverlay("search");
    setQuery("");
    fn();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(o) => (o ? uiActions.openOverlay("search") : uiActions.closeOverlay("search"))}
      title="Recherche produits"
      description="Rechercher un produit, une marque ou une catégorie"
    >
      <CommandInput
        placeholder="Tensiomètre, Omron, stéthoscope…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Aucun résultat pour « {query} »</CommandEmpty>

        {query === "" && recent.length > 0 && (
          <CommandGroup heading="Recherches récentes">
            {recent.map((r) => (
              <CommandItem key={r} value={`recent-${r}`} onSelect={() => setQuery(r)}>
                <Clock aria-hidden="true" />
                <span>{r}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {query === "" && (
          <CommandGroup heading="Tendances">
            {TRENDING.map((t) => (
              <CommandItem key={t} value={`trend-${t}`} onSelect={() => setQuery(t)}>
                <TrendingUp aria-hidden="true" />
                <span>{t}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.products.length > 0 && (
          <CommandGroup heading="Produits">
            {results.products.map((p) => (
              <CommandItem
                key={p.id}
                value={`p-${p.slug}`}
                onSelect={() =>
                  go(() => navigate({ to: "/product/$slug", params: { slug: p.slug } }), p.name)
                }
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-surface-muted text-muted-foreground/50">
                  <Pill className="size-4" aria-hidden="true" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{p.brand}</span>
                </div>
                <Badge variant="soft" size="sm" className="ml-auto">
                  {formatMoney(p.price)}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.categories.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Catégories">
              {results.categories.map((c) => (
                <CommandItem
                  key={c.slug}
                  value={`c-${c.slug}`}
                  onSelect={() =>
                    go(() => navigate({ to: "/categories/$slug", params: { slug: c.slug } }), c.name)
                  }
                >
                  <Tag aria-hidden="true" />
                  <span>{c.name}</span>
                  {c.productCount && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {c.productCount} produits
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {results.brands.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Marques">
              {results.brands.map((b) => (
                <CommandItem
                  key={b.slug}
                  value={`b-${b.slug}`}
                  onSelect={() =>
                    go(() => navigate({ to: "/brands/$slug", params: { slug: b.slug } }), b.name)
                  }
                >
                  <Store aria-hidden="true" />
                  <span>{b.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
