# Auratio MVP — Deployment & Demo Distribution Addendum v1.2

**Effective:** 2026-09-07  
**Status:** Authoritative deployment change

## Locked delivery

### Mobile
- Academic demo artifact: installable Android release APK.
- Google Play publication is not required for the MVP.
- Flutter remains cross-platform product architecture.

### Web portal
- Production origin: **https://auratio.cloud**.
- Portal stack: React + TypeScript + Vite.
- Production hosting/runtime: **Vercel**.
- Domain registration/DNS remains with **Hostinger**.
- Hostinger DNS will point `auratio.cloud` to Vercel using the records Vercel provides.
- HTTPS and SPA direct-route/refresh behavior must be verified in production.
- The existing Hostinger shared hosting plan is no longer the authoritative production runtime for the portal; it may remain unused/available separately.

### Backend/API separation
- Supabase/PostgreSQL/Auth/Storage/Edge Functions remain independent backend services.
- Gemini is called server-side through approved backend logic.
- Vercel hosts the portal; choosing Vercel does not move the Supabase/Gemini backend into Vercel unless a later explicit decision does so.

### QA
Final QA must cover local integration → production-like/staging → production smoke. Production smoke must exercise `https://auratio.cloud`, HTTPS, SPA refresh, Auth, representative AI/Human flows, report access, role boundaries, and video lifecycle.

## Precedence
This v1.2 supersedes Deployment Addendum v1.1 only where v1.1 says the portal is hosted on Hostinger. The domain `auratio.cloud` and direct APK decision remain retained.
