/**
 * Site-wide SEO helpers.
 *
 * SITE_URL is the canonical origin used for <link rel="canonical"> and
 * JSON-LD. Set VITE_SITE_URL in the deployment environment once the custom
 * domain is live; until then the public Vercel deployment is used.
 */
export const SITE_URL = (
  (import.meta.env["VITE_SITE_URL"] as string | undefined) ?? "https://bamedshop.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "BA Medical Store";

/** Business phone (WhatsApp + calls), international format, digits only. */
export const BUSINESS_PHONE_E164 = "21624562660";
/** Human-readable business phone. */
export const BUSINESS_PHONE_DISPLAY = "+216 24 56 26 60";

/** Business contact email. */
export const BUSINESS_EMAIL = "bamedicalstore@gmail.com";

/**
 * WhatsApp number used by reservation CTAs and the floating button.
 * VITE_WHATSAPP_NUMBER can override it per deployment.
 */
export const WHATSAPP_NUMBER = (
  (import.meta.env["VITE_WHATSAPP_NUMBER"] as string | undefined) || BUSINESS_PHONE_E164
).replace(/\D/g, "");

/** wa.me deep link with a pre-filled message, or null when not configured. */
export function whatsappLink(message: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Absolute URL for a site path ("/packs/diabete" → "https://…/packs/diabete"). */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Head <script> entry carrying a JSON-LD document. */
export function jsonLdScript(data: Record<string, unknown>) {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqJsonLd(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
}
