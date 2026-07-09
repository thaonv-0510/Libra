Fix HTTP 431 on Azure SSO Callback

Confirmed failure point

Your screenshot shows 431 on the portal, not member:

https://hiec.com.vn/api/auth/callback/azure-hiec?code=1.AXIA...  (very long)

sequenceDiagram
    participant Member as member.hiec.com.vn
    participant Portal as hiec.com.vn
    participant Azure as login.microsoftonline.com

    Member->>Portal: /login?source=member-hiec
    Note over Portal: signOut SKIPPED for external SSO
    Portal->>Azure: signIn azure-hiec
    Azure->>Portal: /api/auth/callback/azure-hiec?code=LONG
    Note over Portal: 431 here — cookies + long URL exceed buffer
    Portal--xMember: SSO never completes

Root cause

HTTP 431 = Request Header Fields Too Large. On this callback request the browser sends:





Very long request URL — Azure AD code param is normal but large (~2–4 KB)



Large Cookie header — NextAuth OAuth cookies (pkce, state, csrf) plus stale next-auth.session-token JWT chunks and custom sessionID

The critical code path: external SSO login skips signOut, so old NextAuth cookies are never cleared before a new Azure flow starts.

  useEffect(() => {
    if (isExternalSso) return;   // <-- stale cookies kept for member SSO
    signOut({ callbackUrl: '/login', redirect: false });
  }, [isExternalSso]);

MongoDBAdapter is imported in [ectool/src/server/lib/auth.ts](ectool/src/server/lib/auth.ts) and mongoClientPromise is already exported from [ectool/src/server/lib/index.ts](ectool/src/server/lib/index.ts), but database sessions were never enabled — NextAuth still uses default JWT-in-cookie strategy, which produces large chunked cookies.

Fix strategy (two layers)

Layer 1 — Application (primary, required)

1a. Clear NextAuth cookies before external SSO Azure login

In [ectool/src/app/(auth)/login/components/LoginForm.tsx](ectool/src/app/(auth)/login/components/LoginForm.tsx):





Change the useEffect so signOut({ redirect: false }) runs even when isExternalSso is true (or run it immediately before signIn('azure-hiec', ...) in the Azure button handler)



Keep sessionID-based portal session intact if needed — signOut only clears NextAuth cookies, not the custom sessionID cookie from [ectool/src/server/services/auth.ts](ectool/src/server/services/auth.ts)

1b. Switch NextAuth to database sessions

In [ectool/src/server/lib/auth.ts](ectool/src/server/lib/auth.ts):





Wire the already-imported adapter:

  import { mongoClientPromise } from '@/server/lib';
  // inside authOptions return:
  adapter: MongoDBAdapter(mongoClientPromise, { databaseName: process.env.DB_NAME }),
  session: { strategy: 'database', maxAge: 30 * 24 * 60 * 60 },
  






This replaces large JWT session cookies with a small session token (~tens of bytes)

1c. Clear NextAuth cookies after SSO bridge redirect

In [ectool/src/app/auth/sso/callback/route.ts](ectool/src/app/auth/sso/callback/route.ts):





Before NextResponse.redirect(externalUrl), delete NextAuth cookies from the response (next-auth.session-token, __Secure-next-auth.session-token, chunked variants, next-auth.csrf-token, etc.)



Portal session for the user is already in sessionID DB cookie — NextAuth cookies are not needed once redirecting to member

1d. Prevent oversized userAvatar cookie (defensive)

In [ectool/src/utils/getUserAvatar.ts](ectool/src/utils/getUserAvatar.ts) and [ectool-member/src/utils/getUserAvatar.ts](ectool-member/src/utils/getUserAvatar.ts):





Stop storing base64 image data in cookies (can be 50 KB+)



Either remove saveUserAvatarToCookie or replace with DB/API lookup via existing getAccountImage

Layer 2 — Infrastructure (safety net for production)

Add [ectool/public/web.config](ectool/public/web.config) for Azure App Service IIS front-end:

<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <security>
      <requestFiltering>
        <!-- Increase limits for OAuth callback URL + cookies -->
        <requestLimits maxQueryString="32768" maxUrl="32768" />
      </requestFiltering>
    </security>
    <httpProtocol>
      <customHeaders>
        <remove name="X-Powered-By" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>

Deploy and verify on Azure. If 431 persists on Linux-only slots, check Azure portal Configuration → General settings or open an Azure support ticket for maxRequestBytes on the platform proxy.

Cleanup

Remove temporary debug instrumentation added during investigation:





[ectool/src/middleware.ts](ectool/src/middleware.ts)



[ectool-member/src/middleware.ts](ectool-member/src/middleware.ts)



Debug fetch blocks in [ectool/src/app/auth/sso/callback/route.ts](ectool/src/app/auth/sso/callback/route.ts) and [ectool-member/src/app/auth/callback/route.ts](ectool-member/src/app/auth/callback/route.ts)

Verification





Clear all cookies for hiec.com.vn and member.hiec.com.vn in browser



Visit member.hiec.com.vn → triggers redirect to portal login with source=member-hiec



Click Login with Azure AD



Confirm /api/auth/callback/azure-hiec?code=... returns 302 (not 431)



Confirm redirect chain completes: /auth/sso/callback → member.hiec.com.vn/auth/callback → /ec/jobs



In DevTools Network tab, inspect the callback request Cookie header — should be under ~4 KB after fix

Risk notes





Enabling MongoDBAdapter creates NextAuth collections (users, sessions, accounts) in the existing MongoDB — first deploy may write new docs; no migration of existing users needed since signIn callback already calls findOrCreateUserFromAzure



signOut before external SSO is safe: user is not yet authenticated for this flow; Azure login will recreate a fresh minimal session
