# Navigation architecture

Milestone 3 wires every route of the Berlin Food mobile app into one predictable
structure built on **Expo Router** (file-based routing). The web application
(`../client`) is the reference for paths, roles and access rules.

## Route groups

| Group | Purpose | Access |
| --- | --- | --- |
| `src/app/index.tsx` | Landing screen | Public |
| `src/app/(public)` | Login, 3-step sign-up, password reset, courier application | Public |
| `src/app/(menu, cart)` — `(customer)` | Menu, cart, and the signed-in customer surfaces | Menu + cart public, orders/profile signed in |
| `(admin)` | Dashboard, menu editor, orders, users, delivery requests, profile | `profiles.role = 'admin'` |
| `(delivery)` | Dashboard, order queue, routes, active delivery, profile | `profiles.role = 'delivery'` |

Route groups `(name)` are invisible in the URL, which lets the app keep the web
application's paths exactly. Every role group is a **stack whose first screen is
a nested tabs group**: `(admin)`, `(customer)` and `(delivery)` each contain a
`(tabs)` group with the tab screens, while everything that is pushed from a tab
is a stack sibling. See [Role groups: Stack → Tabs](#role-groups-stack--tabs).

```
/                                  landing
/menu                              menu (guests allowed)
/menu/[id]                         dish details
/auth/login                        sign in
/auth/register                     step 1 — personal details
/auth/register/contact             step 2 — account setup
/auth/register/address             step 3 — delivery address
/auth/forgot-password              password reset request
/auth/reset-password               new password
/auth/register-as-delivery         courier application
/auth/track-delivery-request       application status
/auth/complete-registration/[id]   approved courier setup
/customer/orders                   order history (signed in)
/customer/cart                     cart (guests allowed)
/customer/profile                  profile (signed in)
/customer/addresses                address management (signed in)
/admin/dashboard | menu | orders | users | delivery-requests | profile
/delivery/dashboard | orders | for-delivery | profile
/delivery/active-delivery/[id]     active route (pushed from the routes tab)
```

## Guards

* `src/app/_layout.tsx` holds the root `Stack` and wraps the role groups in
  `Stack.Protected`. When a guard flips (sign in / sign out / role change) the
  guarded screens are removed from the navigation state instead of being
  replaced in place, so there is no flash of a screen the user may not see.
* `(customer)` is intentionally **not** guarded at the root: the web app serves
  `/menu` and `/customer/cart` to guests. `(customer)/(tabs)/_layout.tsx`
  guards the orders and profile tabs with `Tabs.Protected`; a guest is redirected to
  `/auth/login`, a signed-in user with another role is sent to their own home.
* The role is read from `profiles.role` (Supabase), with `auth.user_metadata.role`
  as a fallback while the profile row is loading so a freshly signed-in admin
  never flickers through the customer navigator.
* Unauthenticated deep links into `/admin/*` or `/delivery/*` land on
  `/auth/login` (the web app's behaviour); guests opening `/customer/orders` or
  `/customer/profile` also land on the sign-in screen, while `/menu` and
  `/customer/cart` stay open.
* Every role has one home: `ROLE_HOME` in `src/navigation/routes.ts`
  (mirrors the web app's `/{role}/profile` redirect after sign-in).

## Role groups: Stack → Tabs

Each role group owns a plain `Stack` at its root and a `Tabs` navigator inside a
`(tabs)` route group. The group path keeps the URL stable because `(tabs)` is a
route group and therefore invisible in the URL:

```
src/app/(delivery)/_layout.tsx                         Stack
src/app/(delivery)/(tabs)/_layout.tsx                  Tabs
src/app/(delivery)/(tabs)/delivery/dashboard.tsx       tab
src/app/(delivery)/(tabs)/delivery/orders.tsx          tab
src/app/(delivery)/(tabs)/delivery/for-delivery.tsx    tab
src/app/(delivery)/(tabs)/delivery/profile.tsx         tab
src/app/(delivery)/delivery/active-delivery/[id].tsx   Stack screen
```

The same shape applies to `(customer)` (`menu`, `customer/orders`,
`customer/cart`, `customer/profile` in `(tabs)`, `customer/addresses` as a Stack
screen) and `(admin)` (`admin/dashboard|menu|orders|users|profile` in `(tabs)`,
`admin/delivery-requests` as a Stack screen).

Pushed detail screens — active delivery, the address book, delivery requests —
are **Stack siblings, never hidden tabs**. In expo-router, `options={{ href:
null }}` marks a tab as hidden, and the tabs navigator redirects a focused
hidden tab to its initial visible tab
(`useVisibleTabsWithRedirect`). Declaring those screens as hidden tabs is
therefore what made "View route" (and the profile/users links) bounce back to
the Dashboard, Menu or Users tab. Each Tabs layout also pins its anchor
(`unstable_settings.anchor`) to the dashboard/home tab
(`delivery/dashboard`, `admin/dashboard`, `menu`) so the fallback matches the
web application.

## Header and tab bar

* Screens render the shared `AppHeader` (`src/components/navigation`) instead of
  the native header, so the warm background, typography and spacing match the
  design system and no hairline separator is drawn.
* Each role layout supplies a floating `AppTabBar` built from `ROLE_TABS`. Tab
  configuration lives next to the route constants, so labels, icons, paths and
  the visible tabs can never drift apart.
* The customer tab bar hides Orders and Profile for guests and shows the cart
  badge from the persisted cart store.

## Back button, deep links and state

* Android hardware back pops the native stack. Inside a tab navigator the tabs
  use `backBehavior="history"`, so back returns to the previously visited tab
  before leaving the app.
* `AppHeader`'s back affordance calls `router.back()` when history exists and
  falls back to the landing screen after a cold deep link.
* Deep links use the `berlinfood` scheme (see `app.json`). Unmatched URLs render
  `src/app/+not-found.tsx` instead of failing silently.
* Navigation state is preserved per group: switching tabs does not reset the
  stack of the other tabs, and the role groups keep their state while the user
  moves to a public screen and back.

## Deviations from the web URL scheme

Only the pushed detail screens differ, because a file and a folder cannot share
a segment in Expo Router:

| Web | Mobile | Reason |
| --- | --- | --- |
| — (no dish page) | `/menu/[id]` | New mobile screen |
| `/delivery/for-delivery/[id]` | `/delivery/active-delivery/[id]` | Keeps `/delivery/for-delivery` as a tab |

Everything else matches the web application's paths.
