import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { ClinicalHistorySearch } from "./_components/clinical-history-search";

export default function ClinicalHistoryPage() {
  return (
    <div className="min-h-screen bg-background dark">
      <AppHeader
        subtitle="Visualizacion de historia clinica"
        rightSlot={<SignOutButton />}
      />
      <main className="container mx-auto px-6 py-8">
        <ClinicalHistorySearch />
      </main>
    </div>
  );
}
