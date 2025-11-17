import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { ClinicalHistorySearch } from "./_components/clinical-history-search";
import { readSession } from "@/lib/session";

export default async function ClinicalHistoryPage() {
  const session = await readSession();
  const documentNumber = session?.attributes?.numero_documento ?? session?.healthUser?.id ?? null;
  const email = session?.attributes?.email ?? null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        subtitle="Visualizacion de historia clinica"
        contactInfo={{ document: documentNumber ?? undefined, email: email ?? undefined }}
        rightSlot={<SignOutButton />}
      />
      <main className="container mx-auto px-6 py-8">
        <ClinicalHistorySearch ci={documentNumber ?? undefined} />
      </main>
    </div>
  );
}
