# Berlin Food Mobile — Tasks

> Milestones from initial setup to production-ready release.
> Mark a step or rule as `[x]` when complete.
> The web app is in `../client` 
> Note : don't touch the existing web app inside `../client`

---

## Milestone 1: Project Setup & Tooling

### Steps
- [x] Initialize React Native project with TypeScript
- [x] Configure NativeWind and verify styling works on iOS and Android
- [x] Set up navigation library (React Navigation or Expo Router use the recommend in docs or community  )
- [x] Install Zustand and create the base store structure
- [x] Install and configure the Supabase client
- [x] Add secure session storage for authentication tokens
- [x] Configure environment variables for Supabase URL and anon key
- [x] Set up path aliases and strict TypeScript configuration
- [x] Configure ESLint and Prettier
- [x] Add a shared folder structure (components, screens, hooks, services, stores, types, utils)
- [x] Configure app icons, splash screen, and app name
- [] Verify the app builds and runs on Android 

### Rules
- [x] Never hardcode secrets, credentials, or environment-specific configuration
- [x] Never expose Supabase service-role keys in the app
- [x] Use TypeScript strictly; avoid `any` unless absolutely necessary
---

## Milestone 2: Design System & Theming

### Steps
- [x] Load Plus Jakarta Sans font family
- [x] Define semantic color tokens for light mode
- [x] Define semantic color tokens for dark mode
- [x] Set primary color `#9F4200` and accent color `#F27121`
- [x] Define warm neutral palette (avoid pure black and pure white)
- [x] Define spacing, radius, and typography scales
- [x] Configure NativeWind theme and dark mode support
- [x] Build the theme toggle with persisted user selection
- [x] Build base UI components (Button, Input, Card, Text, Badge, Modal, etc.)
- [x] Ensure every base component supports light and dark modes
- [x] Build loading, empty, and error state components
- [x] Verify contrast and readability in both themes

### Rules
- [x] Every new screen and component must support both light and dark modes from the beginning
- [x] Use tonal depth over borders
- [x] Follow the no-line rule for section separation
- [x] Use warm minimalism; never use pure black or pure white
- [x] Prefer NativeWind classes over inline styles
- [x] Centralize design tokens; avoid hardcoded colors
- [x] Preserve the warm, premium visual identity in dark mode
- [x] Avoid simply inverting light-mode colors

---

## Milestone 3: Navigation Architecture

### Steps
- [x] Set up the root navigator
- [x] Create public, delivery, customer, and admin navigation groups
- [x] Implement protected routes based on authentication state
- [x] Implement role-based navigation for admin , customer and delivery users
- [x] Handle authentication state changes without navigation glitches
- [x] Handle Android back-button behavior correctly
- [x] Add a custom header and tab bar consistent with the design system
- [x] Verify deep linking and navigation state restoration where applicable

### Rules
- [x] Maintain a predictable navigation structure
- [x] Use the navigation architecture already established in the project
- [x] Keep screens focused on composition rather than complex logic
- [x] Preserve navigation state where appropriate

> Implementation notes live in `docs/navigation.md` (route map, guards, header/tab bar
> conventions, deep linking and the small set of intentional URL deviations).

---

## Milestone 4: Supabase Integration & Services

### Steps
- [] Read and inspect the existing `/src/services` logic before any update
- [] Port existing services to the mobile app without changing business rules
- [] Define TypeScript types for the existing database schema
- [] Implement shared query and mutation helpers
- [] Ensure all services respect existing RLS policies
- [] Implement consistent loading, success, empty, and error handling
- [] Verify network error and retry handling
- [] Ensure no business logic is duplicated from the web application

### Rules
- [] Use the same Supabase project as the web application
- [] Maintain the same database schema, tables, relationships, and constraints
- [] Reuse existing Supabase queries and business logic whenever possible
- [] Do not invent database tables, columns, relationships, or Supabase policies
- [] Follow existing Row Level Security policies
- [] Never expose privileged secrets in the mobile application
- [] The mobile app is another client of the existing backend, not a separate backend

---

## Milestone 5: Authentication

### Steps
- [] Implement email/password login
- [] Implement Google OAuth login
- [] Implement sign-up and account setup
- [] Implement password reset flow
- [] Implement session persistence across app restarts
- [] Implement secure token refresh and logout
- [] Gate routes based on auth state
- [] Verify user and admin authentication behavior matches the web app
- [] Handle auth errors and loading states consistently

### Rules
- [] Use Supabase Auth exclusively
- [] Never store sensitive credentials in plain AsyncStorage
- [] Keep authentication behavior consistent with the web application
- [] Maintain consistent authentication and authorization rules

---

## Milestone 6: Onboarding Flow

### Steps
- [] Build the onboarding navigation flow
- [] Build personal details step
- [] Build delivery address step
- [] Build account setup step
- [] Add validation matching the web application
- [] Persist onboarding progress where appropriate
- [] Redirect returning and completed users correctly
- [] Support both light and dark modes on every step

### Rules
- [] Reuse the same validation and business rules as the web application
- [] Handle keyboard interactions correctly in forms
- [] Handle loading, success, empty, and error states consistently
- [] Do not introduce different onboarding rules

---

## Milestone 7: Customer Features

### Steps
- [] Build restaurant/menu browsing screen
- [] Build category browsing and filtering
- [] Build food details screen
- [] Build cart and order placement flow
- [] Build order management screens
- [] Build My Orders (order history) screen
- [] Build user profile and settings screen
- [] Build delivery address management screens
- [] Add pull-to-refresh and pagination where appropriate
- [] Optimize long lists with FlatList
- [] Use optimized image loading and caching

### Rules
- [] Maintain feature parity with the web application
- [] Build mobile-first interfaces rather than translating web layouts
- [] Use React Native primitives; avoid HTML elements and browser APIs
- [] Preserve existing functionality and business rules
- [] Every screen must support light and dark modes
- [] Prefer FlatList for long or dynamic lists

---

## Milestone 8: Admin Features

### Steps
- [] Implement admin authentication and access control
- [] Build analytics dashboard
- [] Build menu management screens
- [] Build order management screens
- [] Adapt admin layouts to small screens without losing functionality
- [] Verify permissions match the web application

### Rules
- [] Do not change underlying admin functionality or permissions
- [] Adapt interfaces to mobile screen sizes rather than removing features
- [] Follow existing RLS and authorization rules
- [] Every admin screen must support light and dark modes

---

## Milestone 9: Performance & Quality

### Steps
- [] Optimize list rendering and memoization
- [] Optimize image loading, caching, and sizing
- [] Optimize network requests and caching strategy
- [] Reduce unnecessary re-renders in Zustand selectors
- [] Handle safe areas consistently
- [] Handle keyboard interactions on all forms
- [] Support different screen sizes and orientations where appropriate
- [] Run performance profiling on low-end devices
- [] Fix TypeScript errors and remove unsafe `any` usage
- [] Run linting and formatting checks

### Rules
- [] Optimize rendering, navigation, images, lists, and network requests
- [] Keep components small, reusable, and maintainable
- [] Separate UI components from business logic
- [] Extract shared hooks and utilities
- [] Report assumptions and potential compatibility issues instead of silently making architectural decisions

---

## Milestone 10: Testing & Verification

### Steps
- [] Test authentication flows on iOS and Android
- [] Test onboarding flow end to end
- [] Test menu browsing and food details
- [] Test cart and order placement
- [] Test order history and profile management
- [] Test address management
- [] Test admin flows and permissions
- [] Test light and dark modes on every screen
- [] Test network failure, empty, and error states
- [] Verify behavior consistency with the web application
- [] Test session persistence across restarts

### Rules
- [] Test important user flows after implementation
- [] Avoid breaking changes to existing functionality
- [] Verify that the mobile implementation behaves consistently with the web application

---

## Milestone 11: Production Readiness & Release

### Steps
- [] Configure production Supabase environment variables
- [] Configure app versioning and build numbers
- [] Configure release signing for Android
- [] Configure provisioning and signing for iOS
- [] Configure EAS or equivalent build pipeline
- [] Add crash reporting and error monitoring
- [] Add analytics if already used by the web application
- [] Verify permissions and privacy manifest requirements
- [] Prepare store listings, screenshots, and descriptions
- [] Run a final QA pass on release builds
- [] Submit to Google Play and Apple App Store

### Rules
- [] Never hardcode secrets, credentials, or environment-specific configuration
- [] Keep environment variables properly configured
- [] Do not install unnecessary packages during release hardening
- [] Do not introduce different business rules or duplicate backend logic
- [] Deliver a polished native experience with complete light and dark mode support
