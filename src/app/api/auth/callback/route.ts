import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  exchangeAuthorizationCode,
  fetchUserInfo,
  GUBUY_REDIRECT_COOKIE,
  GUBUY_STATE_COOKIE,
  GUBUY_VERIFIER_COOKIE,
  GUBUY_NONCE_COOKIE,
  verifyIdToken,
} from "@/lib/gubuy";
import { clearSession, setSession, type PortalSession } from "@/lib/session";

function buildRedirectResponse(request: NextRequest, location: string) {
  const url = location.startsWith("http")
    ? location
    : new URL(location, request.nextUrl.origin).toString();
  return NextResponse.redirect(url);
}

function redirectWithError(request: NextRequest, message: string) {
  const url = new URL("/login", request.nextUrl.origin);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

function extractStringClaim(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return undefined;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const errorParam = requestUrl.searchParams.get("error");
  if (errorParam) {
    return redirectWithError(request, errorParam);
  }

  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  if (!code || !state) {
    return redirectWithError(request, "Respuesta invalida de GUB.UY.");
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(GUBUY_STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(GUBUY_VERIFIER_COOKIE)?.value;
  const expectedNonce = cookieStore.get(GUBUY_NONCE_COOKIE)?.value;
  const redirectTo = cookieStore.get(GUBUY_REDIRECT_COOKIE)?.value ?? "/home";

  if (!storedState || storedState !== state) {
    cookieStore.delete(GUBUY_STATE_COOKIE);
    cookieStore.delete(GUBUY_VERIFIER_COOKIE);
    cookieStore.delete(GUBUY_REDIRECT_COOKIE);
    cookieStore.delete(GUBUY_NONCE_COOKIE);
    return redirectWithError(request, "El estado de autenticacion no coincide. Intenta nuevamente.");
  }

  try {
    const tokenResponse = await exchangeAuthorizationCode(code, codeVerifier);

    const idTokenPayload = await verifyIdToken(tokenResponse.id_token);
    const userInfo = await fetchUserInfo(tokenResponse.access_token);
    const tokenClaims = idTokenPayload as Record<string, unknown>;
    const userClaims: Record<string, unknown> = userInfo ?? {};

    if (expectedNonce) {
      const nonceFromToken = extractStringClaim(tokenClaims["nonce"]);
      if (!nonceFromToken || nonceFromToken !== expectedNonce) {
        throw new Error("Nonce mismatch");
      }
    }

    const documentNumber =
      extractStringClaim(userClaims["numero_documento"]) ??
      extractStringClaim(tokenClaims["numero_documento"]) ??
      extractStringClaim(tokenClaims["uid"]) ??
      extractStringClaim(tokenClaims["sub"]) ??
      "unknown";

    const email =
      extractStringClaim(userClaims["email"]) ?? extractStringClaim(tokenClaims["email"]);

    const fullName =
      extractStringClaim(userClaims["nombre_completo"]) ??
      extractStringClaim(tokenClaims["nombre_completo"]) ??
      [
        extractStringClaim(userClaims["primer_nombre"]) ??
          extractStringClaim(tokenClaims["given_name"]),
        extractStringClaim(userClaims["primer_apellido"]) ??
          extractStringClaim(tokenClaims["family_name"]),
      ]
        .filter(Boolean)
        .join(" ") ||
      extractStringClaim(tokenClaims["name"]) ||
      email ||
      documentNumber;

    const identityLevel =
      extractStringClaim(userClaims["nid"]) ?? extractStringClaim(tokenClaims["nid"]);

    const attributes: Record<string, string> = {};
    if (documentNumber) attributes.numero_documento = documentNumber;
    if (email) attributes.email = email;
    if (identityLevel) attributes.nid = identityLevel;
    const issuer = extractStringClaim(tokenClaims["iss"]);
    if (issuer) attributes.issuer = issuer;
    const idp =
      extractStringClaim(userClaims["idp"]) ?? extractStringClaim(tokenClaims["idp"]);
    if (idp) attributes.idp = idp;

    const session: PortalSession = {
      healthUser: {
        id: documentNumber,
        name: fullName,
      },
      healthWorker: {
        id: "gubuy-worker-placeholder",
        name: "Profesional asignado",
      },
      clinic: {
        id: "gubuy-clinic-placeholder",
        name: "Centro de Salud",
      },
      access: {
        source: "GUBUY_OIDC",
        message: `Sesion iniciada como ${fullName}`,
      },
      issuedAt: new Date().toISOString(),
      tokens: {
        idToken: tokenResponse.id_token,
        expiresAt: tokenResponse.expires_in
          ? Date.now() + tokenResponse.expires_in * 1000
          : undefined,
      },
      attributes,
    };

    await setSession(session);

    const response = buildRedirectResponse(request, redirectTo);
    response.cookies.delete(GUBUY_STATE_COOKIE);
    response.cookies.delete(GUBUY_VERIFIER_COOKIE);
    response.cookies.delete(GUBUY_REDIRECT_COOKIE);
    response.cookies.delete(GUBUY_NONCE_COOKIE);

    return response;
  } catch (error) {
    console.error("Failed to complete GUB.UY callback", error);
    await clearSession();
    const cookieStore = await cookies();
    cookieStore.delete(GUBUY_STATE_COOKIE);
    cookieStore.delete(GUBUY_VERIFIER_COOKIE);
    cookieStore.delete(GUBUY_REDIRECT_COOKIE);
    cookieStore.delete(GUBUY_NONCE_COOKIE);
    return redirectWithError(
      request,
      "No se pudo verificar la identidad con GUB.UY. Intenta nuevamente.",
    );
  }
}
