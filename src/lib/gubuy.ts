import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export interface OpenIdConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  end_session_endpoint?: string;
  jwks_uri: string;
  scopes_supported?: string[];
  response_types_supported?: string[];
  claims_supported?: string[];
}

export interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  id_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

let discoveryPromise: Promise<OpenIdConfiguration> | null = null;
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

export const GUBUY_STATE_COOKIE = "gubuy_oauth_state";
export const GUBUY_VERIFIER_COOKIE = "gubuy_oauth_code_verifier";
export const GUBUY_REDIRECT_COOKIE = "gubuy_post_login_redirect";
export const GUBUY_NONCE_COOKIE = "gubuy_oauth_nonce";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export function getClientId(): string {
  return requireEnv("GUBUY_CLIENT_ID");
}

export function getClientSecret(): string | undefined {
  return process.env.GUBUY_CLIENT_SECRET;
}

export function getRedirectUri(): string {
  return requireEnv("GUBUY_REDIRECT_URI");
}

export function getRequestedScopes(): string {
  return process.env.GUBUY_SCOPES ?? "openid personal_info email document profile";
}

export function getRequestedAcrValues(): string | undefined {
  return process.env.GUBUY_ACR_VALUES;
}

export function getPostLogoutRedirectUri(): string {
  return process.env.GUBUY_POST_LOGOUT_REDIRECT_URI ?? "http://localhost:3000/login";
}

export async function getOpenIdConfiguration(): Promise<OpenIdConfiguration> {
  if (!discoveryPromise) {
    const issuer = requireEnv("GUBUY_ISSUER").replace(/\/+$/, "");
    const discoveryUrl =
      process.env.GUBUY_DISCOVERY_URL ??
      process.env.GUBUY_WELL_KNOWN_URL ??
      `${issuer}/.well-known/openid-configuration`;
    discoveryPromise = fetch(discoveryUrl, { cache: "no-cache" }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to load OpenID configuration (${res.status} ${res.statusText}): ${text}`,
        );
      }
      const data = (await res.json()) as OpenIdConfiguration;
      return data;
    });
  }

  return discoveryPromise;
}

export async function getJwks() {
  if (!jwksCache) {
    const config = await getOpenIdConfiguration();
    jwksCache = createRemoteJWKSet(new URL(config.jwks_uri));
  }
  return jwksCache;
}

export async function verifyIdToken(idToken: string): Promise<JWTPayload> {
  const config = await getOpenIdConfiguration();
  const jwks = await getJwks();
  const clientId = getClientId();

  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: config.issuer,
    audience: clientId,
  });

  return payload;
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string | undefined,
): Promise<TokenResponse> {
  const config = await getOpenIdConfiguration();
  const clientId = getClientId();
  const redirectUri = getRedirectUri();
  const clientSecret = getClientSecret();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
  });

  if (codeVerifier) {
    body.set("code_verifier", codeVerifier);
  }

  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }

  const response = await fetch(config.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const json = (await response.json()) as TokenResponse & { error?: string; error_description?: string };

  if (!response.ok || json.error) {
    const errorMessage = json.error_description ?? json.error ?? response.statusText;
    throw new Error(`GUB.UY token exchange failed: ${errorMessage}`);
  }

  if (!json.id_token) {
    throw new Error("Token response missing id_token");
  }

  return json;
}

export async function fetchUserInfo(accessToken: string | undefined) {
  if (!accessToken) return null;
  const config = await getOpenIdConfiguration();
  if (!config.userinfo_endpoint) return null;

  const response = await fetch(config.userinfo_endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function createRandomString(bytes = 32): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(bytes))).toString("base64url");
}

export async function createPkceChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest).toString("base64url");
}
