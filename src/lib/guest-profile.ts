"use client";

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
  } catch {}
}
