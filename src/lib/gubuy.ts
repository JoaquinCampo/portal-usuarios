import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify, type JWTPayload } from "jose";
import { createPublicKey, createVerify } from "node:crypto";

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
let jwksRawPromise: Promise<JsonWebKey[]> | null = null;
const legacyKeyCache = new Map<string, JsonWebKey>();
const DEFAULT_LEGACY_KEY = "__default__";

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

async function getRawJwks(): Promise<JsonWebKey[]> {
  if (!jwksRawPromise) {
    jwksRawPromise = (async () => {
      const config = await getOpenIdConfiguration();
      const retries = 2;
      for (let attempt = 0; attempt < retries; attempt += 1) {
        try {
          const response = await fetch(config.jwks_uri, { cache: "no-cache" });
          if (!response.ok) {
            const text = await response.text();
            throw new Error(
              `Failed to load JWKS (${response.status} ${response.statusText}): ${text}`,
            );
          }
          const data = (await response.json()) as { keys?: JsonWebKey[] };
          const keys = data.keys ?? [];
          cacheLegacyKeys(keys);
          return keys;
        } catch (error) {
          if (attempt === retries - 1) {
            throw error;
          }
        }
      }
      return [];
    })().catch((error) => {
      jwksRawPromise = null;
      if (legacyKeyCache.size > 0) {
        return Array.from(legacyKeyCache.values());
      }
      throw error;
    });
  }
  return jwksRawPromise;
}

function cacheLegacyKeys(keys: JsonWebKey[]): void {
  for (const key of keys) {
    if (key.kty !== "RSA") continue;
    const cacheKey =
      typeof key.kid === "string" && key.kid.length > 0 ? key.kid : DEFAULT_LEGACY_KEY;
    legacyKeyCache.set(cacheKey, key);
    if (cacheKey !== DEFAULT_LEGACY_KEY && !legacyKeyCache.has(DEFAULT_LEGACY_KEY)) {
      legacyKeyCache.set(DEFAULT_LEGACY_KEY, key);
    }
  }
}

function getCachedLegacyKey(kid?: string): JsonWebKey | undefined {
  if (kid && legacyKeyCache.has(kid)) {
    return legacyKeyCache.get(kid);
  }
  return legacyKeyCache.get(DEFAULT_LEGACY_KEY) ?? legacyKeyCache.values().next().value;
}

async function resolveLegacyJwk(kid?: string): Promise<JsonWebKey> {
  const cached = getCachedLegacyKey(kid);
  if (cached) {
    return cached;
  }
  const keys = await getRawJwks();
  const jwk = keys.find((key) => key.kty === "RSA" && (!kid || key.kid === kid));
  if (jwk) {
    return jwk;
  }
  throw new Error("Unable to locate RSA key for ID token verification");
}

export async function verifyIdToken(idToken: string): Promise<JWTPayload> {
  const config = await getOpenIdConfiguration();
  const jwks = await getJwks();
  const clientId = getClientId();

  try {
    const { payload } = await jwtVerify(idToken, jwks, {
      issuer: config.issuer,
      audience: clientId,
    });
    return payload;
  } catch (error) {
    if (
      !(
        error instanceof TypeError &&
        typeof error.message === "string" &&
        error.message.includes("modulusLength")
      )
    ) {
      throw error;
    }
    return verifyIdTokenWithLegacyRsaKey(idToken, config, clientId);
  }
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

async function verifyIdTokenWithLegacyRsaKey(
  idToken: string,
  config: OpenIdConfiguration,
  clientId: string,
): Promise<JWTPayload> {
  const { kid, alg } = decodeProtectedHeader(idToken);
  if (alg !== "RS256") {
    throw new Error("Unsupported ID token algorithm");
  }
  const jwk = await resolveLegacyJwk(kid ?? undefined);
  if (!jwk || typeof jwk.n !== "string" || typeof jwk.e !== "string") {
    throw new Error("Unable to locate RSA key for ID token verification");
  }

  const publicKey = createPublicKey({ key: jwk, format: "jwk" });
  const [encodedHeader, encodedPayload, encodedSignature] = idToken.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("ID token has an invalid format");
  }

  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const signature = base64UrlToBuffer(encodedSignature);
  const isValid = verifier.verify(publicKey, signature);
  if (!isValid) {
    throw new Error("Invalid ID token signature");
  }

  const payloadJson = base64UrlToBuffer(encodedPayload).toString("utf-8");
  const payload = JSON.parse(payloadJson) as JWTPayload;
  validateIdTokenClaims(payload, config, clientId);

  return payload;
}

function base64UrlToBuffer(value: string): Buffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64");
}

function validateIdTokenClaims(
  payload: JWTPayload,
  config: OpenIdConfiguration,
  clientId: string,
): void {
  const issuerCandidates = new Set<string>();
  const normalizedIssuer = config.issuer.replace(/\/+$/, "");
  issuerCandidates.add(normalizedIssuer);
  issuerCandidates.add(`${normalizedIssuer}/oidc`);
  issuerCandidates.add(`${normalizedIssuer}/oidc/v1`);

  const tokenIssuer = typeof payload.iss === "string" ? payload.iss.replace(/\/+$/, "") : "";
  if (!tokenIssuer || !issuerCandidates.has(tokenIssuer)) {
    throw new Error("Unexpected ID token issuer");
  }

  const audience = payload.aud;
  const audienceMatch =
    (typeof audience === "string" && audience === clientId) ||
    (Array.isArray(audience) && audience.includes(clientId));
  if (!audienceMatch) {
    throw new Error("ID token audience does not include the configured client id");
  }

  const now = Math.floor(Date.now() / 1000);
  const tolerance = 60;

  if (typeof payload.exp === "number" && payload.exp + tolerance < now) {
    throw new Error("ID token has expired");
  }

  if (typeof payload.nbf === "number" && payload.nbf - tolerance > now) {
    throw new Error("ID token is not yet valid");
  }

  if (typeof payload.iat === "number" && payload.iat - tolerance > now) {
    throw new Error("ID token issue time is in the future");
  }
}
