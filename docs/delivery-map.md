# Delivery route map

The active-delivery screen (`src/screens/delivery/ActiveDeliveryScreen.tsx`)
shows a real driving map through `RouteMap`
(`src/features/delivery/components/RouteMap.tsx`): the courier's current
position as the **pickup** pin, the customer address as the **destination**
pin, and the driving line between them.

## Why a WebView + Leaflet + OSM + OSRM

- **Visual parity with the web app.** The web delivery map
  (`client/src/components/delivery/MapDestination.tsx`) already uses Leaflet
  1.9.4 with OpenStreetMap tiles and the public OSRM routing server. Reusing the
  same stack keeps pins, colours, route geometry and attribution consistent
  across both products.
- **No map SDK, no API key.** Tiles come from OpenStreetMap in both themes
  (dark mode is a CSS filter, see below). Routing comes from
  `router.project-osrm.org`. Both are keyless.
- **Why not `expo-maps`?** On Android, `expo-maps` renders Google Maps, which
  requires a Google Maps SDK key enabled on a **billable** Google Cloud
  project. That is a configuration and cost dependency the delivery flow does
  not need; Leaflet in a WebView works on both platforms without native map
  configuration.

The page is a fully self-contained HTML document built in
`buildMapHtml()`. Coordinates, colours and tile URLs are passed through
`JSON.stringify`; user-provided labels are never interpolated into the HTML.
Leaflet and its CSS load from `unpkg.com`, so the map needs network access.

## Tiles and dark mode

Both themes use the **OpenStreetMap standard tiles**
(`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`). Dark mode is produced
by a CSS filter over the Leaflet **tile pane only**:

```css
.leaflet-tile-pane {
  filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9) saturate(0.85);
}
```

The filter is deliberately scoped to `.leaflet-tile-pane` so the marker and
popup layers keep their accent colours. The React Native `surfaceVariant` token
stays behind the tiles as the map background, so a missing tile still reads as
part of the UI.

The previous implementation requested CARTO `dark_all` basemaps for dark mode.
CARTO now serves a small "API key required" watermark instead of real tiles, and
this project must stay keyless, so all CARTO references were removed. Do not
reintroduce a provider that needs a key or a token.

If the primary tiles fail repeatedly (three `tileerror` events), the page swaps
the layer to the keyless OSM France HOT tiles
(`https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`) exactly once and
updates the attribution to "&copy; OpenStreetMap contributors, Tiles: OSM
France". Tile failures are not forwarded to React Native — the destination pin
and legend remain usable.

Note the [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/):
the public tile servers are best-effort and not intended for production traffic.
Before launch, move to a paid or self-hosted tile provider.

## Where the pickup comes from

There are no restaurant coordinates in the database, so the pickup pin is the
courier's own GPS position, read once on mount by
`src/features/delivery/hooks/use-courier-location.ts` (foreground permission
only — no watchers, no background tasks). If permission is denied, location
services are off, or reading the fix fails, `pickup` is `null` and the map
falls back to a **destination-only** view centred on the customer at zoom 15.
A straight line is never drawn as a substitute for a real route.

## OSRM demo-server caveat

`router.project-osrm.org` is the public OSRM **demo** server. It is rate
limited, has no uptime guarantee, and must not be used for production traffic.
Before launch, swap the URL in `buildMapHtml()` for a self-hosted OSRM
instance, a paid routing provider, or a Directions API. When the route request
fails (offline, 4xx/5xx, empty result) the page keeps the destination pin, the
screen shows the "You"/"Customer" legend instead of a distance chip, and no
error is surfaced — routing is a visual enhancement, not a blocker.

## Rebuild after install

`react-native-webview` contains native code. After adding it, Expo Go cannot
load it and the existing development build is stale. Rebuild the dev client
before testing:

```bash
npx expo run:android   # or: npx expo run:ios
# or
eas build --profile development
```

`npx expo install react-native-webview` used the SDK 58 resolver, so the
version is pinned to the one Expo supports for this SDK.
