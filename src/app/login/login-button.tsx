"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function LoginButton() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") ?? "/home";

  const handleLogin = useCallback(() => {
    const target = new URL("/api/auth/login", window.location.origin);
    if (redirectTo) {
      target.searchParams.set("redirectTo", redirectTo);
    }
    window.location.href = target.toString();
  }, [redirectTo]);

  return (
    <Button size="lg" className="w-full" onClick={handleLogin}>
      Iniciar sesion con GUB.UY
    </Button>
  );
}
