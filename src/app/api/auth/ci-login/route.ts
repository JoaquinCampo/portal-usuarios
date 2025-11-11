import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GUEST_CI_COOKIE_NAME } from "@/lib/cookie-names";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const ci = formData.get("ci") as string;
  const redirectTo = formData.get("redirectTo") as string || "/home";

  if (!ci) {
    return NextResponse.redirect(new URL("/login?error=CI requerido", request.url));
  }

  // Set the guest CI cookie
  const cookieStore = await cookies();
  cookieStore.set(GUEST_CI_COOKIE_NAME, ci, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return NextResponse.redirect(new URL(redirectTo, request.url));
}