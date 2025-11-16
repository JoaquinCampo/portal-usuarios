"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, FileText, History, ShieldCheck } from "lucide-react";

import { AppHeader } from "@/app/_components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionCard } from "../_components/option-card";
import { readGuestProfile, saveGuestProfile, type GuestHealthUser } from "@/lib/guest-profile";
import { GUEST_CI_COOKIE_NAME } from "@/lib/cookie-names";

type FetchState = "idle" | "loading" | "success" | "error";

const GUEST_CI_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function persistGuestCi(ci?: string | null) {
  if (typeof document === "undefined") return;
  const sanitized = ci?.trim();
  if (sanitized) {
    document.cookie = `${GUEST_CI_COOKIE_NAME}=${encodeURIComponent(
      sanitized
    )}; path=/; max-age=${GUEST_CI_MAX_AGE_SECONDS}; SameSite=Lax`;
  } else {
    document.cookie = `${GUEST_CI_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export default function HomeGuest() {
  const [ci, setCi] = useState("");
  const [profile, setProfile] = useState<GuestHealthUser | null>(null);
  const [state, setState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedProfile = readGuestProfile();
    setProfile(storedProfile);
    persistGuestCi(storedProfile?.ci);
  }, []);

  const subtitle = useMemo(
    () => (profile ? `Bienvenido ${profile.firstName ?? "Invitado"}.` : "Bienvenido Invitado."),
    [profile]
  );

  const clinicInfo = profile?.clinicNames?.length
    ? `Clínicas asociadas: ${profile.clinicNames.join(", ")}`
    : "Modo invitado - Valida tu cédula para cargar tus datos.";
  const documentInfo = profile?.ci ?? "No disponible";
  const emailInfo = profile?.email ?? "No disponible";

  const onValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ci) return;
    setState("loading");
    try {
      const res = await fetch(`/api/health-user/${encodeURIComponent(ci)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Cédula inválida o no encontrada"
        );
      }
      const p: GuestHealthUser = {
        id: String(data.id ?? ""),
        ci: String(data.ci ?? ci),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        clinicNames: data.clinicNames ?? [],
      };
      saveGuestProfile(p);
      setProfile(p);
      persistGuestCi(p.ci);
      setState("success");
    } catch (err: unknown) {
      setState("error");
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <AppHeader
        subtitle={subtitle}
        contactInfo={{ document: documentInfo, email: emailInfo }}
        rightSlot={
          <a
            href="/login"
            className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Iniciar Sesión
          </a>
        }
      />

      <main className="container mx-auto px-6 py-12 space-y-10">
        <section className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Validación de identidad
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Cédula</h2>
            <p className="text-sm text-muted-foreground">
              Ingresa tu cédula para cargar tu información y habilitar las gestiones del portal.
            </p>
          </div>

          <form
            className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]"
            onSubmit={onValidate}
          >
            <div>
              <label htmlFor="guest-ci" className="text-sm font-medium text-foreground">
                Número de cédula
              </label>
              <Input
                id="guest-ci"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                placeholder="Ingresa tu cédula sin puntos ni guiones"
                inputMode="numeric"
                pattern="[0-9]*"
                className="mt-2 rounded-xl border-border/70 bg-background"
                aria-describedby="guest-ci-helper"
              />
              <p id="guest-ci-helper" className="mt-2 text-xs text-muted-foreground">
                Solo números. Guardamos tu dato hasta 8 horas para agilizar futuros ingresos.
              </p>
            </div>
            <Button
              type="submit"
              disabled={state === "loading"}
              className="h-full rounded-2xl px-8 text-sm font-semibold shadow-sm transition hover:shadow-md"
            >
              {state === "loading" ? "Validando..." : "Validar"}
            </Button>
          </form>

          {state === "error" && error ? (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {state === "success" ? (
            <p className="mt-4 text-sm text-emerald-600" role="status">
              Datos cargados correctamente.
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-dashed border-border/70 bg-card/40 p-6 text-sm text-muted-foreground shadow-sm">
          <p>{clinicInfo}</p>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Gestiones disponibles
            </p>
            <h2 className="text-2xl font-semibold text-foreground">
              Elige la acción que necesitas
            </h2>
            <p className="text-sm text-muted-foreground">
              Estas opciones siguen disponibles para invitados una vez verificados.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <OptionCard
              title="Gestión de notificaciones"
              description="Activa o desactiva el envío de notificaciones."
              href="/notifications"
              ctaLabel="Gestionar"
              icon={<Bell className="h-5 w-5" />}
            />

            <OptionCard
              title="Visualización de historia clínica"
              description="Accede a documentos clínicos y sus detalles."
              href="/clinical-history"
              ctaLabel="Historia"
              icon={<FileText className="h-5 w-5" />}
            />

            <OptionCard
              title="Visualización de accesos"
              description="Listado de accesos a documentos clínicos (ejemplo)."
              href="/clinical-history-access"
              ctaLabel="Accesos"
              icon={<History className="h-5 w-5" />}
            />

            <OptionCard
              title="Políticas de acceso"
              description="Gestiona las políticas de acceso a la historia clínica."
              href="/access-policies"
              ctaLabel="Ver políticas"
              icon={<ShieldCheck className="h-5 w-5" />}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
