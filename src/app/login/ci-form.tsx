"use client";

import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CIForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") ?? "/home";

  return (
    <form action="/api/auth/ci-login" method="post" className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div>
        <label htmlFor="ci" className="text-sm font-medium text-foreground">
          Número de Cédula
        </label>
        <Input
          id="ci"
          name="ci"
          type="text"
          placeholder="Ingresa tu número de cédula"
          required
        />
      </div>
      <Button size="lg" className="w-full" type="submit">
        Iniciar sesión con Cédula
      </Button>
    </form>
  );
}
