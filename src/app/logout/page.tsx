import Link from "next/link";

import { AppHeader } from "@/app/_components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LogoutPage() {
  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <AppHeader subtitle="Has cerrado la sesión" homeHref="/login" />

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md border-border bg-card p-8 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Sesión finalizada</h1>
          <p className="text-sm text-muted-foreground">
            Tu sesión fue cerrada correctamente.
          </p>
          <div className="pt-2">
            <Button asChild>
              <Link href="/login">Volver a iniciar sesión</Link>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
