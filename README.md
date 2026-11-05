# Berlin Food Mobile

React Native mobile client for the Berlin Food platform, built with Expo, Expo Router, NativeWind, Zustand, and Supabase.

## Stack

- Expo SDK 58 / React Native 0.88
- TypeScript (strict)
- Expo Router
- NativeWind (Tailwind CSS)
- Zustand
- Supabase (`@supabase/supabase-js`)

## Getting started

```bash
npm install
cp .env.example .env
npm run start
```

Fill `.env` with the same Supabase project used by the web app:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

Use only the public anon/publishable key. Never add the service-role key to the mobile app.

## Commands

```bash
npm run start        # start the dev server
npm run android      # start on Android
npm run ios          # start on iOS (macOS)
npm run web          # start on web
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run format       # Prettier write
npm run format:check # Prettier check
npm run doctor       # expo-doctor
```

## Project structure

```text
src/
  app/        Expo Router routes and layouts
  components/ Reusable UI components
  constants/  Design tokens and shared constants
  hooks/      Shared hooks
  screens/    Composed screen implementations used by routes
  services/   Backend services (Supabase client and queries)
  stores/     Zustand stores
  types/      Shared TypeScript types
  utils/      Shared utilities
  global.css  Tailwind entry and global styles
```
