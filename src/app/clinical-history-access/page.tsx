import { redirect } from "next/navigation";

import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { readSession } from "@/lib/session";
import { ClinicalHistoryAccessClient } from "./_components/clinical-history-access-client";

export default async function ClinicalHistoryAccessPage() {
  const session = await readSession();
  if (!session) {
    redirect("/login?redirectTo=/clinical-history-access");
  }

  const documentNumber = session.attributes?.numero_documento ?? session.healthUser.id;
  const email = session.attributes?.email ?? undefined;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        subtitle="Visualizacion de accesos a historia clinica"
        contactInfo={{ document: documentNumber, email }}
        rightSlot={<SignOutButton />}
      />
      <main className="container mx-auto px-6 py-8">
        <ClinicalHistoryAccessClient ci={documentNumber} />
      </main>
    </div>
  );
}
