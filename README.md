# OutFyt.co.in — Fashion Discovery Affiliate Platform

OutFyt.co.in curates complete outfits featured across social platforms (Instagram, YouTube, Pinterest) and connects visitors with individual clothing pieces and verified affiliate retailer links.

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend Services**: Firebase Authentication & Cloud Firestore (Named DB: `ai-studio-outfytcoin-f3920ea2-7315-4751-a131-cd9f6a4343b9`)
- **Media Storage**: Supabase Storage (`outfit-media` bucket via signed upload edge functions)
- **Hosting**: Netlify (`outfythere.netlify.app`)

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env.local` by copying `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SUPABASE_STORAGE_BUCKET`.
3. Start local development server:
   ```bash
   npm run dev
   ```
4. Verify types and production build:
   ```bash
   npm run lint
   npm run build
   ```

## Netlify deployment

Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
`VITE_SUPABASE_STORAGE_BUCKET` in the project's Netlify environment variables
with build scope enabled. For local development, set the same variables in an
untracked `.env.local` file using `.env.example` as a template. Supabase
configuration is required; project credentials are not hardcoded in the source.

Vite embeds `VITE_` variables in the browser bundle, even when their values come
from Netlify. Only use a Supabase public anon or publishable key for
`VITE_SUPABASE_ANON_KEY`; never use a service-role or secret key. Enforce access
with Supabase Row Level Security and Storage policies.

`netlify.toml` excludes only these three intentionally public settings from
secrets scanning using `[build.environment]`. Scanning remains enabled for all
other environment variables and files. Keep real credentials out of committed
files; if a privileged key has already been exposed, rotate it before deploying.
