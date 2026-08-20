<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Congo Key website

Vite/React website for Congo Key, with public pages, contact forms, client portal and a Supabase-backed admin area.

## Production configuration

Create `.env.local` from `.env.example` and configure:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_PASSWORD`
- `VITE_CLIENT_PORTAL_PASSWORD`
- `VITE_WHATSAPP_NUMBER`

Without Supabase credentials, dynamic modules fail closed instead of pretending to submit data. The WhatsApp floating button is hidden until `VITE_WHATSAPP_NUMBER` is set.

## Client portal configuration

The site owner updates client spaces from `/admin`, tab `Espace Client`.
With Supabase configured, each client space is saved in `client_portals` with its own project ID and password. `/portal` authenticates through the Supabase RPC `get_client_portal_by_credentials`. Documents are uploaded to the `client-documents` storage bucket.
Without Supabase, the same screen saves to browser localStorage for local demo use.

Local demo access:

- Admin: `/admin`, password `admin-demo-2026`
- Client portal: `/portal`, project ID `PRJ-C4-DEMO`, password `client-demo-2026`

For production, run `supabase-client-portal.sql` in Supabase before using this module. It creates `client_portal_settings`, `client_portals`, the client-auth RPC, plus public storage buckets `site-assets` and `client-documents`.
When Supabase is configured, `/admin` uses Supabase Auth email/password. The login screen includes a first-account creation mode backed by Supabase Auth. After creating the admin account, disable open signups in Supabase Auth settings unless you add stricter role-based policies. Without Supabase, it uses the local demo password from `.env.local`.

Running SQL is not enough for the local site: `.env.local` must also contain `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then the Vite dev server must be restarted.

## Run locally

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Build for production: `npm run build`
4. Type-check: `npm run typecheck`
