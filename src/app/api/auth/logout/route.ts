import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  getOpenIdConfiguration,
  getPostLogoutRedirectUri,
  GUBUY_REDIRECT_COOKIE,
  GUBUY_STATE_COOKIE,
  GUBUY_VERIFIER_COOKIE,
} from "@/lib/gubuy";
import { clearSession, readSession } from "@/lib/session";

function resolveRedirect(origin: string, target: string) {
  if (target.startsWith("http://") || target.startsWith("https://")) {
    return target;
  }
  return new URL(target, origin).toString();
}

export async function GET(request: NextRequest) {
  const [session, cookieStore] = await Promise.all([readSession(), cookies()]);

  await clearSession();
  cookieStore.delete(GUBUY_STATE_COOKIE);
  cookieStore.delete(GUBUY_VERIFIER_COOKIE);
  cookieStore.delete(GUBUY_REDIRECT_COOKIE);

  const defaultRedirect = resolveRedirect(
    request.nextUrl.origin,
    getPostLogoutRedirectUri(),
  );

  let target = defaultRedirect;

  try {
    if (session?.tokens?.idToken) {
      const config = await getOpenIdConfiguration();
      if (config.end_session_endpoint) {
        const logoutUrl = new URL(config.end_session_endpoint);
        logoutUrl.searchParams.set("post_logout_redirect_uri", defaultRedirect);
        logoutUrl.searchParams.set("id_token_hint", session.tokens.idToken);
        target = logoutUrl.toString();
      }
    }
  } catch (error) {
    console.warn("Failed to contact GUB.UY logout endpoint", error);
  }

  const response = NextResponse.redirect(target);
  response.cookies.delete(GUBUY_STATE_COOKIE);
  response.cookies.delete(GUBUY_VERIFIER_COOKIE);
  response.cookies.delete(GUBUY_REDIRECT_COOKIE);

  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
