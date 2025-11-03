import { redirect } from "next/navigation";

import { readSession } from "@/lib/session";

export default async function RootRedirect() {
  const session = await readSession();
  redirect(session ? "/home" : "/login");
}
