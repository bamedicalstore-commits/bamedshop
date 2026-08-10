import { useEffect, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingWhatsAppProps {
  /** International format without leading +, e.g. "21671000000" */
  phone?: string;
  defaultMessage?: string;
  className?: string;
}

const AGENT_NAME = "Support BA Medical";

/**
 * Bouton WhatsApp flottant + mini bulle promotionnelle.
 * WCAG : role button, aria-labels, focus visible, dismissible.
 */
export function FloatingWhatsApp({
  phone = "21671000000",
  defaultMessage = "Bonjour BA Medical Store, j'ai une question sur un produit.",
  className,
}: FloatingWhatsAppProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [message, setMessage] = useState(defaultMessage);

  useEffect(() => {
    const t = window.setTimeout(() => setDismissed(false), 2500);
    return () => window.clearTimeout(t);
  }, []);

  const buildHref = () => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6",
        className,
      )}
    >
      {!open && !dismissed && (
        <div className="relative max-w-[220px] rounded-2xl border border-border bg-background p-3 pr-8 text-xs shadow-[var(--shadow-elevated)]">
          <p className="font-semibold">Besoin d'aide ?</p>
          <p className="mt-0.5 text-muted-foreground">Discutez avec un conseiller sur WhatsApp.</p>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Fermer l'invitation WhatsApp"
            className="absolute right-2 top-2 rounded-full p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Chat WhatsApp"
          className="w-[300px] overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]"
        >
          <div className="flex items-center justify-between gap-2 bg-[oklch(0.55_0.14_150)] px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold leading-tight">{AGENT_NAME}</p>
                <p className="text-[10px] text-primary-foreground/80">En ligne · répond en 5 min</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer le chat"
              className="rounded-full p-1 hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="space-y-3 bg-surface-muted p-4">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-background p-3 text-xs text-foreground shadow-sm">
              Bonjour 👋, comment pouvons-nous vous aider ?
            </div>
            <label htmlFor="wa-message" className="sr-only">
              Votre message
            </label>
            <textarea
              id="wa-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-input bg-background p-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button asChild size="sm" width="full">
              <a href={buildHref()} target="_blank" rel="noopener noreferrer">
                <Send className="size-3" aria-hidden="true" />
                Ouvrir dans WhatsApp
              </a>
            </Button>
          </div>
        </div>
      )}

      <Button
        variant="floating"
        size="icon-lg"
        aria-label={open ? "Fermer le chat WhatsApp" : "Ouvrir le chat WhatsApp"}
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setDismissed(true);
        }}
        className="bg-[oklch(0.55_0.14_150)] hover:bg-[oklch(0.5_0.14_150)]"
      >
        {open ? <X /> : <MessageCircle />}
      </Button>
    </div>
  );
}
