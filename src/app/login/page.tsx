import { redirect } from "next/navigation";

import { AppHeader } from "@/app/_components/app-header";
import { Card } from "@/components/ui/card";
import { LoginButton } from "./login-button";
import { readSession } from "@/lib/session";

interface LoginPageProps {
  searchParams?: Promise<{
    redirectTo?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await readSession();

  if (session) {
    redirect("/home");
  }

  const params = (await searchParams) ?? {};
  const errorMessage = params.error;

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <AppHeader subtitle="Acceso al portal de usuarios" homeHref="/login" />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-border bg-card p-8 text-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Bienvenido al Portal de Usuarios
            </h2>
            <p className="text-sm text-muted-foreground">
              Usa tu identidad digital para ingresar y gestionar tus servicios de salud de forma segura.
            </p>
            {errorMessage ? (
              <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}
            <LoginButton />
          </div>
        </Card>
      </main>
    </div>
  );
}
