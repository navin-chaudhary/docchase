export const COOKIE_CONSENT_KEY = "docchase_cookie_consent";

export type CookieConsent = "accepted" | "rejected";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

export function setCookie(
  name: string,
  value: string,
  days = 365
): void {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function getCookieConsent(): CookieConsent | null {
  const value = getCookie(COOKIE_CONSENT_KEY);
  if (value === "accepted" || value === "rejected") return value;
  return null;
}

export function setCookieConsent(value: CookieConsent): void {
  setCookie(COOKIE_CONSENT_KEY, value, 365);
}
