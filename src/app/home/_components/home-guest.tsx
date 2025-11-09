"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, FileText, History, ShieldCheck } from "lucide-react";

import { AppHeader } from "@/app/_components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OptionCard } from "../_components/option-card";
import { readGuestProfile, saveGuestProfile, type GuestHealthUser } from "@/lib/guest-profile";

type FetchState = "idle" | "loading" | "success" | "error";

export default function HomeGuest() {
  const [ci, setCi] = useState("");
  const [profile, setProfile] = useState<GuestHealthUser | null>(null);
  const [state, setState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProfile(readGuestProfile());
  }, []);

  const subtitle = useMemo(
    () => (profile ? `Bienvenido ${profile.firstName ?? "Invitado"}.` : "Bienvenido Invitado."),
    [profile]
  );

  const clinicInfo = profile?.clinicNames?.length
    ? `Clínicas asociadas: ${profile.clinicNames.join(", ")}`
    : "Modo invitado - Valida tu cédula para cargar tus datos.";

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
      setState("success");
    } catch (err: any) {
      setState("error");
      setError(String(err?.message ?? err));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        subtitle={subtitle}
        rightSlot={<a href="/login" className="text-sm text-muted-foreground hover:text-foreground">Iniciar Sesión</a>}
      />

      <main className="container mx-auto px-6 py-12 space-y-6">
        <Card className="border-border bg-card p-6">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={onValidate}>
            <div className="flex-1">
              <label className="mb-1 block text-sm text-foreground">Cédula</label>
              <Input
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                placeholder="Ingresa tu cédula sin puntos ni guiones"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <Button type="submit" disabled={state === "loading"}>
              {state === "loading" ? "Validando..." : "Validar"}
            </Button>
          </form>
          {state === "error" && error ? (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          ) : null}
          {state === "success" ? (
            <p className="mt-3 text-sm text-green-600">Datos cargados correctamente.</p>
          ) : null}
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-foreground">Documento</h3>
            <p className="mt-1 text-lg text-muted-foreground">{profile?.ci ?? "No disponible"}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-medium text-foreground">Correo</h3>
            <p className="mt-1 text-lg text-muted-foreground break-all">{profile?.email ?? "No disponible"}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card/40 p-6 text-sm text-muted-foreground">
          <p>{clinicInfo}</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <OptionCard
            title="Gestión de notificaciones"
            description="Activa o desactiva el envío de notificaciones."
            href="/notifications"
            ctaLabel="Gestionar"
            icon={<Bell className="h-4 w-4" />}
          />

          <OptionCard
            title="Visualización de historia clínica"
            description="Accede a documentos clínicos y sus detalles."
            href="/clinical-history"
            ctaLabel="Historia"
            icon={<FileText className="h-4 w-4" />}
          />

          <OptionCard
            title="Visualización de accesos"
            description="Listado de accesos a documentos clínicos (ejemplo)."
            href="/clinical-history-access"
            ctaLabel="Accesos"
            icon={<History className="h-4 w-4" />}
          />

          <OptionCard
            title="Políticas de acceso"
            description="Revisa y resuelve solicitudes de acceso a la historia clínica."
            href="/access-policies"
            ctaLabel="Ver políticas"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
        </div>
      </main>
    </div>
  );
}
