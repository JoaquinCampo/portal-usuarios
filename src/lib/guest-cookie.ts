import { cookies } from "next/headers";
import { GUEST_PROFILE_COOKIE_NAME } from "./cookie-names";

export interface GuestProfileCookieData {
  ci?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

function decodeProfileValue(raw?: string | null): GuestProfileCookieData | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    const ci = typeof parsed.ci === "string" ? parsed.ci : undefined;
    const email = typeof parsed.email === "string" ? parsed.email : undefined;
    const firstName = typeof parsed.firstName === "string" ? parsed.firstName : undefined;
    const lastName = typeof parsed.lastName === "string" ? parsed.lastName : undefined;
    return { ci, email, firstName, lastName };
  } catch {
    return null;
  }
}

export async function readGuestProfileCookie(): Promise<GuestProfileCookieData | null> {
  const store = await cookies();
  const raw = store.get(GUEST_PROFILE_COOKIE_NAME)?.value;
  return decodeProfileValue(raw);
}

export function parseGuestProfileCookie(value?: string | null): GuestProfileCookieData | null {
  return decodeProfileValue(value);
}
