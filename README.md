<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f3920ea2-7315-4751-a131-cd9f6a4343b9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

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
