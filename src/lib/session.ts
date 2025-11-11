import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./cookie-names";

export { SESSION_COOKIE_NAME };

export interface PortalSession {
  healthUser: {
    id: string;
    name: string;
  };
  healthWorker: {
    id: string;
    name: string;
  };
  clinic: {
    id: string;
    name: string;
  };
  access: {
    source: string;
    message: string;
  };
  issuedAt: string;
  tokens?: {
    idToken: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  };
  attributes?: Record<string, string>;
}

function toCookieValue(session: PortalSession): string {
  return JSON.stringify(session);
}

function fromCookieValue(value: string | undefined): PortalSession | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as PortalSession;
  } catch {
    return null;
  }
}

export async function setSession(session: PortalSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, toCookieValue(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function readSession(): Promise<PortalSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return fromCookieValue(raw);
}
