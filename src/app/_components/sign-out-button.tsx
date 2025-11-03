"use client";

import { useCallback } from "react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const handleSignOut = useCallback(() => {
    window.location.href = "/api/auth/logout";
  }, []);

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      Cerrar sesion
    </Button>
  );
}
