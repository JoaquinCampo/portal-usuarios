import { AppHeader } from "@/app/_components/app-header";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { ClinicalHistorySearch } from "./_components/clinical-history-search";
import { readSession } from "@/lib/session";
import { cookies } from "next/headers";
import { GUEST_CI_COOKIE_NAME, GUEST_PROFILE_COOKIE_NAME } from "@/lib/cookie-names";
import { parseGuestProfileCookie } from "@/lib/guest-cookie";

export default async function ClinicalHistoryPage() {
  const session = await readSession();
  const cookieStore = await cookies();
  const guestCi = cookieStore.get(GUEST_CI_COOKIE_NAME)?.value;
  const guestProfile = parseGuestProfileCookie(cookieStore.get(GUEST_PROFILE_COOKIE_NAME)?.value);
  const documentNumber =
    session?.attributes?.numero_documento ?? session?.healthUser?.id ?? guestProfile?.ci ?? guestCi ?? null;
  const email = session?.attributes?.email ?? guestProfile?.email ?? null;

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
