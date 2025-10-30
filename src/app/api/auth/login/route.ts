import { NextRequest, NextResponse } from "next/server";

import {
  createPkceChallenge,
  createRandomString,
  getClientId,
  getOpenIdConfiguration,
  getRequestedAcrValues,
  getRequestedScopes,
  getRedirectUri,
  GUBUY_NONCE_COOKIE,
  GUBUY_REDIRECT_COOKIE,
  GUBUY_STATE_COOKIE,
  GUBUY_VERIFIER_COOKIE,
} from "@/lib/gubuy";

function errorRedirect(request: NextRequest, message: string) {
  const url = new URL("/login", request.nextUrl.origin);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  try {
    const [config] = await Promise.all([getOpenIdConfiguration()]);

    const state = createRandomString(32);
    const codeVerifier = createRandomString(64);
    const codeChallenge = await createPkceChallenge(codeVerifier);
    const nonce = createRandomString(32);
    const redirectUri = getRedirectUri();
    const scopes = getRequestedScopes();
    const acrValues = getRequestedAcrValues();

    const requestUrl = new URL(request.url);
    const redirectTo = requestUrl.searchParams.get("redirectTo") ?? "/home";

    const authorizationUrl = new URL(config.authorization_endpoint);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", getClientId());
    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    authorizationUrl.searchParams.set("scope", scopes);
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set("code_challenge", codeChallenge);
    authorizationUrl.searchParams.set("code_challenge_method", "S256");
    authorizationUrl.searchParams.set("nonce", nonce);

    if (acrValues) {
      authorizationUrl.searchParams.set("acr_values", acrValues);
    }

    const response = NextResponse.redirect(authorizationUrl.toString());

    const commonCookieOptions = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    response.cookies.set(GUBUY_STATE_COOKIE, state, {
      ...commonCookieOptions,
      maxAge: 600,
    });
    response.cookies.set(GUBUY_VERIFIER_COOKIE, codeVerifier, {
      ...commonCookieOptions,
      maxAge: 600,
    });
    response.cookies.set(GUBUY_NONCE_COOKIE, nonce, {
      ...commonCookieOptions,
      maxAge: 600,
    });
    response.cookies.set(GUBUY_REDIRECT_COOKIE, redirectTo, {
      ...commonCookieOptions,
      maxAge: 900,
    });

    return response;
  } catch (error) {
    console.error("Failed to initiate GUB.UY login", error);
    return errorRedirect(
      request,
      "No se pudo conectar con GUB.UY. Verifica la configuracion.",
    );
  }
}
