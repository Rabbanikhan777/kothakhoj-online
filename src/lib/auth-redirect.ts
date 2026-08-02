const FALLBACK_ORIGIN = "https://kothakhoj.com";

/**
 * Origin used for Supabase auth redirects.
 * Always the current origin in the browser so links work on preview,
 * lovable.app, and custom domains alike (no cross-domain bounces).
 */
export function authOrigin(): string {
  if (typeof window === "undefined") return FALLBACK_ORIGIN;
  return window.location.origin;
}

export function authRedirectTo(path = "/"): string {
  return `${authOrigin()}${path}`;
}
