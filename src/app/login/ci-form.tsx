"use client";

import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CIForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") ?? "/home";

  return (
    <form action="/api/auth/ci-login" method="post" className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo} />
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
          name="ci"
          type="text"
          placeholder="Ingresa tu cédula sin puntos ni guiones"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-describedby="ci-helper"
          required
        />
        <p id="ci-helper" className="mt-2 text-xs text-muted-foreground">
          Solo números. Guardamos tu dato hasta 8 horas para agilizar futuros ingresos.
        </p>
      </div>
      <Button size="lg" className="w-full" type="submit">
        Validar cédula e ingresar
      </Button>
      <p className="text-xs text-muted-foreground">
        Modo invitado: valídala para cargar tus datos.
      </p>
    </form>
  );
}
