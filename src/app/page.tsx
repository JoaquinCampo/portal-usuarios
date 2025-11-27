import { redirect } from "next/navigation";

interface RootRedirectProps {
  searchParams?: Promise<Record<string, string | undefined>>;
}

export default async function RootRedirect({ searchParams }: RootRedirectProps) {
  const params = (await searchParams) ?? {};

  if (params.code || params.error) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string" && value.length > 0) {
        query.set(key, value);
      }
    }
    const suffix = query.toString();
    redirect(`/callback${suffix ? `?${suffix}` : ""}`);
  }

  redirect("/home");
}
