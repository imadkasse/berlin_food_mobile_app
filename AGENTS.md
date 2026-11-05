# Project: Berlin Food Mobile

## Overview

Berlin Food Mobile is the React Native mobile application for the Berlin Food platform.

It provides the same core functionality and business logic as the existing Berlin Food web application, adapted to deliver a native, smooth, and premium mobile experience.

**Important:** Berlin Food is strictly the application name, not a physical restaurant in Berlin.

The mobile application must maintain feature parity with the web application wherever applicable. Do not introduce different business rules or duplicate backend logic.

## Tech Stack

- **Framework:** React Native
- **Styling:** NativeWind (Tailwind CSS)
- **Backend:** Supabase (Auth, Database, Storage, etc.)
- **Language:** TypeScript
- **Navigation:** React Navigation or Expo Router (follow the existing project setup if exist ).
- **State Management:** Zustand 

## Core Development Principles

1. **Business Logic Consistency:** Reuse the same business rules, validation logic, data structures, and workflows as the web application.
2. **Mobile-First:** Build interfaces specifically for mobile devices rather than directly translating web layouts.
3. **Design Consistency:** Maintain the same visual identity, components, colors, typography, spacing, and overall design language as the web application.
4. **Native Experience:** Use React Native components and platform capabilities where appropriate. Avoid web-specific implementations.
5. **Maintainability:** Keep components reusable, modular, and easy to maintain.
6. **Type Safety:** Use TypeScript strictly. Avoid `any` unless absolutely necessary.
7. **Performance:** Optimize rendering, navigation, images, lists, and network requests for a smooth mobile experience.

## Authentication

Authentication is managed entirely through Supabase Auth.

Supported authentication methods:

- Email / Password login.
- Google OAuth login.
- Session persistence across application restarts.
- Secure token and session management.
- User and admin authentication.

Ensure authentication behavior remains consistent with the web application.

Use secure storage appropriate for React Native when handling authentication sessions. Never store sensitive credentials in plain AsyncStorage.

## App Features

The mobile application must support the following features:

### Customer Features

- Browse restaurant menus.
- View food details and categories.
- Place and manage orders.
- View order history (My Orders).
- Manage user profile and settings.
- Manage delivery addresses.
- Complete the onboarding flow:
  - Personal details.
  - Delivery address.
  - Account setup.

### Admin Features

- Admin authentication.
- Analytics dashboard.
- Menu management.
- Order management.

Adapt admin interfaces to mobile screen sizes without changing their underlying functionality or permissions.

## Backend & Supabase Integration

- Use the same Supabase project as the web application.
- Maintain the same database schema, tables, relationships, and constraints.
- Reuse existing Supabase queries and business logic whenever possible.
- Follow existing Row Level Security (RLS) policies.
- Maintain consistent authentication and authorization rules.
- Handle loading, success, empty, and error states consistently.
- Avoid duplicating business logic in the mobile frontend.
- Never expose Supabase service-role keys or other privileged secrets in the mobile application.

**Important:** The mobile application is another client of the existing backend, not a separate backend implementation.

## Design Context

### Users

**Primary:** Hungry customers at home ordering food for delivery.

Users are relaxed, likely in the evening, browsing on their phones. They want a seamless, premium experience that makes ordering feel special rather than transactional.

### Brand Personality

**Voice:** Premium, refined, sophisticated.

**Tone:** Elegant but approachable — like a curated fine dining experience delivered to your door.

The "Urban Alchemist" concept: Berlin's grit meets gastronomic precision.

### Aesthetic Direction

- **Theme:** Light and dark modes (user-selectable).
- **Primary aesthetic:** Warm minimalism — editorial, spacious, with intentional asymmetry.
- **Primary color:** #9F4200.
- **Accent color:** #F27121.
- **Supporting colors:** Warm neutrals, avoiding stark blacks and whites.
- **Typography:** Plus Jakarta Sans.
- **Corners:** Soft, rounded corners with a consistent design language.
- **Layout:** Generous whitespace and intentional visual hierarchy.

### Design Principles

1. **Tonal Depth Over Borders:** Define sections through background color variations rather than unnecessary borders.
2. **Editorial Typography:** Create strong contrast between headings, display text, and body text.
3. **The No-Line Rule:** Avoid unnecessary 1px solid borders for section separation. Prefer spacing and background variations.
4. **Premium Feel Through Restraint:** Every element must earn its place. Avoid unnecessary visual complexity.
5. **Warm Minimalism:** Avoid pure black (#000000) and pure white (#FFFFFF). Use warm-tinted colors instead.
6. **Consistent Design Language:** Mobile interfaces must feel like a natural extension of the web application.
7. **Native Adaptation:** Preserve the original design identity while adapting layouts and interactions to mobile devices.

## Dark Mode

Dark mode is a first-class design requirement, not an afterthought.

- Support both light and dark themes.
- Allow users to switch themes manually.
- Persist the selected theme across application restarts.
- Use NativeWind's dark mode capabilities.
- Define consistent semantic color tokens for both themes.
- Ensure sufficient contrast and readability in both modes.
- Adapt backgrounds, cards, typography, icons, inputs, and overlays to the active theme.
- Preserve the warm, premium visual identity in dark mode.
- Avoid simply inverting light-mode colors.

**Important:** Every new screen and component must support both light and dark modes from the beginning.

## React Native & NativeWind Guidelines

- Use React Native primitives (`View`, `Text`, `ScrollView`, `FlatList`, etc.).
- Use NativeWind for styling.
- Avoid HTML elements and browser-specific APIs.
- Do not use CSS properties or features unsupported by React Native.
- Prefer `FlatList` for long or dynamic lists.
- Use `SafeAreaView` or the project's existing safe-area solution.
- Handle keyboard interactions correctly, especially in forms and authentication screens.
- Support different screen sizes and device orientations where appropriate.
- Use platform-specific implementations only when necessary.
- Avoid unnecessary inline styles when NativeWind can handle the styling.

## Navigation

- Use the navigation architecture already established in the project.
- Maintain a predictable navigation structure.
- Support protected routes and role-based navigation.
- Handle authentication state changes correctly.
- Preserve navigation state where appropriate.
- Ensure Android back-button behavior is handled correctly.

## Component Architecture

- Build reusable UI components.
- Separate UI components from business logic.
- Keep screens focused on composition rather than implementing complex logic directly.
- Extract shared hooks and utilities.
- Centralize theme colors, spacing, typography, and other design tokens.
- Avoid unnecessary code duplication.
- Keep components small and maintainable.

## Working With the Existing Web Application

When implementing a feature:

1. Inspect the corresponding web application implementation.
2. Understand its business logic, database interactions, validation, and user flows.
3. Identify reusable logic that can be shared safely.
4. Adapt the UI and interactions to React Native.
5. Preserve existing functionality and business rules.
6. Verify that the mobile implementation behaves consistently with the web application.
7. Ensure both light and dark themes are implemented.

Do not blindly copy Next.js components into React Native. Web-specific components, hooks, APIs, and libraries must be replaced with compatible mobile implementations.
I give u the logic inside `/src/services` read before any 

Do not modify the existing web application unless explicitly requested.

## Development Rules

- Read existing project documentation before making changes.
- Inspect the existing folder structure and follow established conventions.
- Prefer existing dependencies over introducing new ones.
- Do not install unnecessary packages.
- Avoid breaking changes to existing functionality.
- Do not invent database tables, columns, relationships, or Supabase policies.
- Never hardcode secrets, credentials, or environment-specific configuration.
- Keep environment variables properly configured.
- Test important user flows after implementation.
- Report assumptions and potential compatibility issues instead of silently making architectural decisions.

## Primary Goal

Build a high-quality React Native mobile application that delivers the same Berlin Food experience, features, and business logic as the existing web application.

The result should feel like the same premium product, not a simplified version of it, while providing a polished native mobile experience with complete light and dark mode support.

## Section for Expo 
This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
