import { redirect } from "next/navigation";

export default async function RootRedirect() {
  redirect("/home");
}
