# Google sign-in (native)

## Flow

```
App → supabase.auth.signInWithOAuth({ skipBrowserRedirect: true })
    → authorize URL opened with WebBrowser.openAuthSessionAsync
    → Google consent
    → https://mbhnuhcjebqszvxcysvd.supabase.co/auth/v1/callback
    → Supabase redirects to redirectTo (app scheme)
    → createSessionFromAuthUrl() consumes tokens / PKCE code
```

`redirectTo` comes from `getAuthRedirectUrl()` in
`src/features/auth/oauth.ts`:

- native / development build: `berlinfood://auth/callback`
- Expo Go: `exp://<host>/--/auth/callback`

Supabase only redirects to `redirectTo` when it matches an allow-listed URL.
Otherwise it falls back to the project **Site URL** — which is why the browser
silently lands on the deployed web app.

## Google Cloud Console

APIs & Services → Credentials → **OAuth 2.0 Client ID (Web application)**:

- Authorized JavaScript origins
  - `https://mbhnuhcjebqszvxcysvd.supabase.co`
  - `https://berlin-food.vercel.app`
  - `http://localhost:3000`
- Authorized redirect URIs
  - `https://mbhnuhcjebqszvxcysvd.supabase.co/auth/v1/callback`

The app scheme (`berlinfood://`) is **not** added to Google Console. Google only
talks to Supabase; the app-scheme hop happens afterwards, from Supabase.

## Supabase

Authentication → URL Configuration:

- Site URL: `https://berlin-food.vercel.app`
- Additional Redirect URLs
  - `https://berlin-food.vercel.app/auth/callback`
  - `berlinfood://**`
  - local development: `exp://**` (Expo Go) and `http://localhost:8081/**`

`berlinfood://**` is required: without it Supabase rejects
`berlinfood://auth/callback` and uses the Site URL instead, so the app appears
to "log in to the website". Changing the callback path in code also requires the
new URL to be allow-listed; the wildcard covers it.

## Testing

Expo Go cannot reliably complete custom-scheme OAuth. Use a development build:

```bash
npx expo run:android
# or
eas build --profile development
```

## Known gaps

- `app.json` has no `ios.bundleIdentifier`. An iOS build needs one, but a
  production identifier must be chosen by the team — **TODO**, not invented here.
- `android.package` is still the placeholder `com.anonymous.berlinfood`.
