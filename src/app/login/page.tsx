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
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader subtitle="Acceso al portal de usuarios" homeHref="/login" />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-border bg-card p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground">
                Bienvenido al Portal de Usuarios
              </h2>
              <p className="text-sm text-muted-foreground">
                Accede con tu Identidad Digital de GUB.UY para sincronizar tus datos.
              </p>
            </div>
            {errorMessage ? (
              <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}
            <div className="space-y-4">
              <div>
                <LoginButton />
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
