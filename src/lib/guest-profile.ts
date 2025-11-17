"use client";

import { GUEST_CI_COOKIE_NAME, GUEST_PROFILE_COOKIE_NAME } from "./cookie-names";

export interface GuestHealthUser {
  id: string;
  ci: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  clinicNames?: string[];
}

const STORAGE_KEY = "guest_health_user";
const GUEST_CI_MAX_AGE_SECONDS = 60 * 60 * 8;

export function persistGuestCi(ci?: string | null) {
  if (typeof document === "undefined") return;
  const sanitized = ci?.trim();
  if (sanitized) {
    document.cookie = `${GUEST_CI_COOKIE_NAME}=${encodeURIComponent(sanitized)}; path=/; max-age=${GUEST_CI_MAX_AGE_SECONDS}; SameSite=Lax`;
  } else {
    document.cookie = `${GUEST_CI_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

function persistGuestProfileCookie(profile?: GuestHealthUser | null) {
  if (typeof document === "undefined") return;
  if (profile) {
    const payload = {
      ci: profile.ci,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
    };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    document.cookie = `${GUEST_PROFILE_COOKIE_NAME}=${encoded}; path=/; max-age=${GUEST_CI_MAX_AGE_SECONDS}; SameSite=Lax`;
  } else {
    document.cookie = `${GUEST_PROFILE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function persistGuestSession(profile: GuestHealthUser | null) {
  persistGuestCi(profile?.ci);
  persistGuestProfileCookie(profile);
}

export function saveGuestProfile(profile: GuestHealthUser) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

export function readGuestProfile(): GuestHealthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GuestHealthUser) : null;
  } catch {
    return null;
  }
}

export function clearGuestProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    persistGuestSession(null);
  } catch {}
}
