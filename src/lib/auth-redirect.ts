const PRODUCTION_ORIGIN = "https://kothakhoj.com";

/**
 * Origin used for Supabase auth redirects.
 * Uses the production domain in production, and the current origin
 * in local dev / Lovable previews so redirects never break.
 */
export function authOrigin(): string {
  if (typeof window === "undefined") return PRODUCTION_ORIGIN;
  const host = window.location.hostname;
  const isPreview =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com");
  return isPreview ? window.location.origin : PRODUCTION_ORIGIN;
}

export function authRedirectTo(path = "/"): string {
  return `${authOrigin()}${path}`;
}
