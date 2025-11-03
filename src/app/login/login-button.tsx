"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function LoginButton() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") ?? "/home";
  const action = useMemo(() => {
    if (process.env.NEXT_PUBLIC_LOGIN_ACTION) {
      return process.env.NEXT_PUBLIC_LOGIN_ACTION;
    }
    return "/api/auth/login";
  }, []);

  return (
    <form action={action} method="post" className="w-full">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <Button size="lg" className="w-full" type="submit">
        Iniciar sesion con GUB.UY
      </Button>
    </form>
  );
}
