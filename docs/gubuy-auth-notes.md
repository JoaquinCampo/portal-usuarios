# GUB.UY (ID Uruguay) OpenID Connect Notes

## Public endpoints (testing environment)

Fetched from `https://auth-testing.iduruguay.gub.uy/oidc/v1/.well-known/openid-configuration`:

- Issuer: `https://auth-testing.iduruguay.gub.uy`
- Authorization endpoint: `https://auth-testing.iduruguay.gub.uy/oidc/v1/authorize`
- Token endpoint: `https://auth-testing.iduruguay.gub.uy/oidc/v1/token`
- UserInfo endpoint: `https://auth-testing.iduruguay.gub.uy/oidc/v1/userinfo`
- End session endpoint: `https://auth-testing.iduruguay.gub.uy/oidc/v1/logout`
- JWKS: `https://auth-testing.iduruguay.gub.uy/oidc/v1/jwks`
- Supported response types: `code`
- Supported scopes: `openid`, `personal_info`, `email`, `document`, `profile`
- Supported ACR values: `urn:iduruguay:nid:{0|1|2|3}`
- Supported ID token signing algorithms: `HS256`, `RS256`
- Claims supported: `nombre_completo`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `uid`, `name`, `given_name`, `family_name`, `pais_documento`, `tipo_documento`, `numero_documento`, `email`, `email_verified`, `numero_telefono`, `rid`, `ae`, `nid`, `idp`

The service documentation advertised by the metadata points to:
`https://centroderecursos.agesic.gub.uy/web/seguridad/wiki/-/wiki/Main/ID+Uruguay+-+Integraci%C3%B3n+con+OpenID+Connect`

## Credentials shared for testing

- `client_id`: `890192`
- `client_secret`: `457d52f181bf11804a3365b49ae4d29a2e03bbabe74997a2f510b179`
- Redirect URIs allowed:
  - `https://openidconnect.net/callback`
  - `http://localhost`
  - `http://localhost:8080`
- Logout redirect URIs allowed:
  - `http://localhost/logout`
  - `http://localhost:8080/logout`

## Observations from Agesic documentation

The official documentation (see the link above) describes the integration
flow at a high level:

1. **Authorization Code Flow** – clients must initiate the login using the
   standard authorization request (`response_type=code`) and PKCE is not
   mandated in testing docs (confirm for production).
2. **Scopes** – `openid` is mandatory, and the additional scopes determine
   which claims are released (`personal_info`, `document`, `email`, etc.).
3. **ACR (Nivel de identidad)** – the `acr_values` parameter lets the client
   request the required identity assurance level (`urn:iduruguay:nid:{0-3}`).
4. **Claims** – custom claims provide Uruguay-specific identity fields
   (document number, country, etc.), so plan claim mapping accordingly.
5. **Logout** – the `end_session_endpoint` supports RP-initiated logout,
   requiring `id_token_hint` and an optional `post_logout_redirect_uri`.

## Implementación en el portal

- `/api/auth/login` arma la URL de autorización con PKCE (`S256`), guarda
  `state`/`code_verifier` en cookies httpOnly y redirige al endpoint oficial.
- `/api/auth/callback` valida el `state`, intercambia el `code` por tokens,
  verifica el `id_token` contra el JWKS remoto y enriquece la sesión con los
  claims (documento, email, nivel de identidad, etc.).
- `/api/auth/logout` limpia la sesión local y, si hay `id_token`, redirige al
  `end_session_endpoint` de GUB.UY con `id_token_hint` + `post_logout_redirect_uri`.
- Las variables necesarias (`GUBUY_ISSUER`, `GUBUY_DISCOVERY_URL`, credenciales,
  scopes, logout URI) viven en `.env`/`.env.example`; el repo incluye
  credenciales de prueba.

Reference implementation: <https://github.com/franps/oidc-client> (Python).
