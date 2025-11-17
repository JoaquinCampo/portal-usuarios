"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  persistGuestSession,
  readGuestProfile,
  saveGuestProfile,
  type GuestHealthUser,
} from "@/lib/guest-profile";

type HealthUserResponse = {
  id?: string;
  ci?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  clinicNames?: string[];
  message?: string;
  error?: string;
};

type FetchState = "idle" | "loading" | "success" | "error";

export function CIForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams?.get("redirectTo") ?? "/home";

  const [ci, setCi] = useState("");
  const [status, setStatus] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readGuestProfile();
    if (stored?.ci) {
      setCi(stored.ci);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!ci.trim()) return;

    setStatus("loading");
    try {
      const response = await fetch(`/api/health-user/${encodeURIComponent(ci.trim())}`);
      const payload = (await response.json()) as HealthUserResponse;
      if (!response.ok) {
        const message = payload?.message || payload?.error || `Error ${response.status}`;
        throw new Error(message);
      }

      const profile: GuestHealthUser = {
        id: String(payload.id ?? ""),
        ci: String(payload.ci ?? ci.trim()),
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        gender: payload.gender,
        dateOfBirth: payload.dateOfBirth,
        address: payload.address,
        clinicNames: payload.clinicNames ?? [],
      };

      saveGuestProfile(profile);
      persistGuestSession(profile);
      setStatus("success");

      setTimeout(() => {
        router.push(redirectTo);
      }, 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Validación de identidad
        </p>
        <h4 className="text-lg font-semibold text-foreground">Cédula</h4>
        <p className="text-sm text-muted-foreground">
          Ingresa tu cédula para cargar tu información y habilitar las gestiones del portal.
        </p>
      </div>
      <div>
        <label htmlFor="ci" className="text-sm font-medium text-foreground">
          Número de Cédula
        </label>
        <Input
          id="ci"
          type="text"
          placeholder="Ingresa tu cédula sin puntos ni guiones"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-describedby="ci-helper"
          value={ci}
          onChange={(event) => setCi(event.target.value)}
          required
        />
        <p id="ci-helper" className="mt-2 text-xs text-muted-foreground">
          Solo números. Guardamos tu dato hasta 8 horas para agilizar futuros ingresos.
        </p>
      </div>
      <Button size="lg" className="w-full" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Validando..." : "Validar cédula e ingresar"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {status === "success" ? (
        <p className="text-sm text-green-600">Datos cargados correctamente. Redirigiendo...</p>
      ) : (
        <p className="text-xs text-muted-foreground">Modo invitado: valídala para cargar tus datos.</p>
      )}
    </form>
  );
}
