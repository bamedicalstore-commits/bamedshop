import { useState, useRef, type MouseEvent } from "react";
import { Pill, Maximize2, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

/**
 * Product gallery with:
 * - Thumbnail rail (keyboard-navigable)
 * - Hover zoom (desktop, pointer:fine)
 * - Fullscreen lightbox (dialog) with next/prev + arrow keys
 * - Graceful placeholder when no images
 */
export function ProductImageGallery({ images, alt, className }: ProductImageGalleryProps) {
  const list = images.length > 0 ? images : [null, null, null, null];
  const [active, setActive] = useState(0);
  const [zoomActive, setZoomActive] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = mainRef.current?.getBoundingClientRect();
    if (!rect) return;
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const prev = () => setActive((i) => (i - 1 + list.length) % list.length);
  const next = () => setActive((i) => (i + 1) % list.length);

  return (
    <div className={cn("grid gap-3 lg:grid-cols-[80px_1fr]", className)}>
      <ul
        className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col"
        aria-label="Miniatures du produit"
      >
        {list.map((src, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Image ${i + 1} sur ${list.length}`}
              aria-current={active === i}
              className={cn(
                "grid size-20 shrink-0 place-items-center overflow-hidden rounded-md border bg-surface-muted text-muted-foreground/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active === i
                  ? "border-primary ring-1 ring-primary/40"
                  : "border-border hover:border-input",
              )}
            >
              {src ? (
                <img src={src} alt="" className="size-full object-cover" loading="lazy" />
              ) : (
                <Pill className="size-6" aria-hidden="true" />
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="order-1 lg:order-2">
        <div
          ref={mainRef}
          className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-muted"
          onMouseEnter={() => setZoomActive(true)}
          onMouseLeave={() => setZoomActive(false)}
          onMouseMove={handleMove}
        >
          {list[active] ? (
            <img
              src={list[active] as string}
              alt={alt}
              className={cn(
                "size-full object-cover transition-transform duration-200",
                zoomActive && "scale-[1.75]",
              )}
              style={zoomActive ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
            />
          ) : (
            <div className="grid size-full place-items-center text-muted-foreground/30">
              <Pill className="size-32" aria-hidden="true" />
            </div>
          )}

          {/* Hover hint */}
          <div className="pointer-events-none absolute bottom-3 left-3 hidden items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur group-hover:flex sm:flex">
            <ZoomIn className="size-3.5" aria-hidden="true" /> Survoler pour zoomer
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Afficher en plein écran"
            onClick={() => setLightbox(true)}
            className="absolute right-3 top-3 rounded-full bg-background/90 backdrop-blur"
          >
            <Maximize2 />
          </Button>

          {list.length > 1 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Image précédente"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 backdrop-blur"
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Image suivante"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 backdrop-blur"
              >
                <ChevronRight />
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          className="max-w-5xl border-none bg-background/95 p-0 backdrop-blur"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
          }}
        >
          <DialogTitle className="sr-only">Vue plein écran — {alt}</DialogTitle>
          <DialogDescription className="sr-only">
            Utilisez les flèches du clavier pour naviguer entre les images.
          </DialogDescription>
          <div className="relative flex aspect-square items-center justify-center bg-surface-muted">
            {list[active] ? (
              <img
                src={list[active] as string}
                alt={alt}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <Pill className="size-40 text-muted-foreground/30" aria-hidden="true" />
            )}
            <Button
              variant="outline"
              size="icon"
              aria-label="Fermer"
              onClick={() => setLightbox(false)}
              className="absolute right-4 top-4 rounded-full"
            >
              <X />
            </Button>
            {list.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Image précédente"
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Image suivante"
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
                >
                  <ChevronRight />
                </Button>
              </>
            )}
          </div>
          <div className="flex justify-center gap-2 border-t border-border p-3">
            {list.map((_, i) => (
              <button
                key={i}
                aria-label={`Aller à l'image ${i + 1}`}
                aria-current={active === i}
                onClick={() => setActive(i)}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  active === i ? "bg-primary" : "bg-muted-foreground/40 hover:bg-muted-foreground",
                )}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
