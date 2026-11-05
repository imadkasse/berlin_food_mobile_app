import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

type LatLng = { lat: number; lng: number };

export type RouteMapProps = {
  pickup: LatLng | null;
  destination: LatLng;
  destinationLabel?: string;
  /** Height in px; default 280. */
  height?: number;
};

type RouteSummary = {
  distanceMeters: number;
  durationSeconds: number;
};

const OSM_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
// Keyless fallback used when the standard OSM tiles keep failing (see the
// `tileerror` handler in the generated page).
const OSM_FRANCE_TILES = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
const OSM_FRANCE_ATTRIBUTION = '&copy; OpenStreetMap contributors, Tiles: OSM France';
type MapColors = {
  pickup: string;
  destination: string;
  ring: string;
  surface: string;
};

/**
 * Builds the self-contained Leaflet document. Every coordinate and colour is
 * serialised with `JSON.stringify`; the destination label is intentionally not
 * injected into the page (it is only used by the native accessibility label).
 */
function buildMapHtml({
  pickup,
  destination,
  isDark,
  colors,
}: {
  pickup: LatLng | null;
  destination: LatLng;
  isDark: boolean;
  colors: MapColors;
}): string {
  const data = {
    pickup,
    destination,
    colors,
    tiles: {
      // Same keyless tiles in both themes; dark mode comes from the CSS filter
      // applied to the tile pane only, so pins keep their accent colours.
      url: OSM_TILES,
      attribution: OSM_ATTRIBUTION,
      fallbackUrl: OSM_FRANCE_TILES,
      fallbackAttribution: OSM_FRANCE_ATTRIBUTION,
    },
  };

  const serialized = JSON.stringify(data);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
        background: transparent;
      }
      #map {
        position: absolute;
        inset: 0;
      }
      .bf-pin {
        background: transparent;
        border: 0;
      }
      .leaflet-control-attribution {
        font-size: 10px;
        line-height: 1.4;
      }
      ${isDark ? '.leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9) saturate(0.85); }' : ''}
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function () {
        var DATA = ${serialized};
        var mapEl = document.getElementById('map');

        function post(payload) {
          try {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            }
          } catch (error) {
            /* The native side is gone — nothing left to report to. */
          }
        }

        if (!window.L) {
          post({ type: 'error', message: 'The map library could not load.' });
          // Report readiness so the native loading overlay never hangs offline;
          // the tonal background and legend remain visible.
          post({ type: 'ready' });
          return;
        }

        if (mapEl && DATA.colors && DATA.colors.surface) {
          mapEl.style.background = DATA.colors.surface;
        }

        var map = L.map('map', {
          zoomControl: false,
          attributionControl: true,
          preferCanvas: true
        });

        var tiles = L.tileLayer(DATA.tiles.url, {
          attribution: DATA.tiles.attribution,
          maxZoom: 19
        }).addTo(map);

        // Keyless graceful degradation: if the primary provider keeps failing,
        // swap to the OSM France HOT layer once. Tile failures are not reported
        // to React Native — the destination pin stays usable regardless.
        var tileErrors = 0;
        var usedFallback = false;

        tiles.on('tileerror', function () {
          if (usedFallback) return;

          tileErrors += 1;

          if (tileErrors < 3) return;

          usedFallback = true;
          tiles.setUrl(DATA.tiles.fallbackUrl);

          var attributionControl = map.attributionControl;

          if (attributionControl) {
            attributionControl.removeAttribution(DATA.tiles.attribution);
            attributionControl.addAttribution(DATA.tiles.fallbackAttribution);
          }
        });

        function makePinIcon(color) {
          return L.divIcon({
            className: 'bf-pin',
            html:
              '<span style="display:block;width:18px;height:18px;border-radius:50%;background:' +
              color +
              ';border:3px solid ' +
              DATA.colors.ring +
              ';box-shadow:0 1px 4px rgba(0,0,0,0.4);"></span>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
        }

        var destination = L.latLng(DATA.destination.lat, DATA.destination.lng);
        L.marker(destination, {
          icon: makePinIcon(DATA.colors.destination),
          title: 'Customer',
          keyboard: false
        }).addTo(map);

        var pickup = null;

        if (DATA.pickup) {
          pickup = L.latLng(DATA.pickup.lat, DATA.pickup.lng);
          L.marker(pickup, {
            icon: makePinIcon(DATA.colors.pickup),
            title: 'You',
            keyboard: false
          }).addTo(map);
          map.fitBounds(L.latLngBounds([pickup, destination]), { padding: [48, 48] });
        } else {
          map.setView(destination, 15);
        }

        function loadRoute() {
          if (!pickup) return;

          var url =
            'https://router.project-osrm.org/route/v1/driving/' +
            pickup.lng +
            ',' +
            pickup.lat +
            ';' +
            destination.lng +
            ',' +
            destination.lat +
            '?overview=full&geometries=geojson';

          fetch(url)
            .then(function (response) {
              if (!response.ok) {
                throw new Error('Route service returned ' + response.status + '.');
              }
              return response.json();
            })
            .then(function (data) {
              var route = data && data.routes && data.routes[0];
              var coordinates = route && route.geometry && route.geometry.coordinates;

              if (!coordinates || !coordinates.length) {
                throw new Error('No driving route found.');
              }

              var latlngs = coordinates.map(function (pair) {
                return [pair[1], pair[0]];
              });

              var line = L.polyline(latlngs, {
                color: DATA.colors.destination,
                weight: 5,
                opacity: 0.9
              }).addTo(map);

              map.fitBounds(line.getBounds(), { padding: [32, 32] });
              post({
                type: 'route',
                distanceMeters: route.distance,
                durationSeconds: route.duration
              });
            })
            .catch(function (error) {
              post({
                type: 'error',
                message:
                  error && error.message ? String(error.message) : 'Route unavailable.'
              });
            });
        }

        map.whenReady(function () {
          post({ type: 'ready' });
          if (pickup) loadRoute();
        });
      })();
    </script>
  </body>
</html>`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;

  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));

  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <Text variant="caption" weight="semibold" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

/**
 * Driving map for the active delivery: the courier's current position as the
 * pickup pin, the customer address as the destination pin, and the OSRM
 * driving route between them. Falls back to a destination-only view when the
 * courier's position is unavailable — never a straight line.
 */
export function RouteMap({ pickup, destination, destinationLabel, height = 280 }: RouteMapProps) {
  const { colorScheme, tokens } = useTheme();
  const [readyHtml, setReadyHtml] = useState<string | null>(null);
  const [summary, setSummary] = useState<(RouteSummary & { html: string }) | null>(null);

  const isDark = colorScheme === 'dark';
  const pickupLat = pickup?.lat ?? null;
  const pickupLng = pickup?.lng ?? null;
  const destinationLat = destination.lat;
  const destinationLng = destination.lng;
  const surface = tokens.surfaceVariant;
  const ring = isDark ? tokens.surfaceRaised : tokens.background;

  const html = useMemo(
    () =>
      buildMapHtml({
        pickup: pickupLat != null && pickupLng != null ? { lat: pickupLat, lng: pickupLng } : null,
        destination: { lat: destinationLat, lng: destinationLng },
        isDark,
        colors: {
          pickup: tokens.primary,
          destination: tokens.accent,
          ring,
          surface,
        },
      }),
    [
      pickupLat,
      pickupLng,
      destinationLat,
      destinationLng,
      isDark,
      tokens.primary,
      tokens.accent,
      ring,
      surface,
    ]
  );

  const source = useMemo(() => ({ html }), [html]);

  // State from the page is tagged with the document that produced it, so a
  // reload (theme change, or the courier's fix arriving) never shows a stale
  // summary and the loading overlay returns until the new page is ready.
  const isReady = readyHtml === html;
  const routeSummary = summary && summary.html === html ? summary : null;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const raw: unknown = JSON.parse(event.nativeEvent.data);

      if (typeof raw !== 'object' || raw === null) return;

      const message = raw as Record<string, unknown>;

      if (message.type === 'ready') {
        setReadyHtml(html);
        return;
      }

      if (message.type === 'route') {
        const { distanceMeters, durationSeconds } = message;

        if (
          typeof distanceMeters === 'number' &&
          Number.isFinite(distanceMeters) &&
          typeof durationSeconds === 'number' &&
          Number.isFinite(durationSeconds)
        ) {
          setSummary({ html, distanceMeters, durationSeconds });
        }
        return;
      }

      // `error` and unknown message types are ignored: the destination pin and
      // the map itself stay usable even when the route service fails.
    } catch {
      // Malformed page message — ignore instead of crashing the screen.
    }
  };

  const accessibleLabel = pickup
    ? `Map showing your position and the customer's delivery destination${
        destinationLabel ? `: ${destinationLabel}` : ''
      }`
    : `Map showing the customer's delivery destination${
        destinationLabel ? `: ${destinationLabel}` : ''
      }`;

  return (
    <View
      className="overflow-hidden rounded-md bg-surface-variant"
      style={{ height }}
      accessibilityRole="image"
      accessibilityLabel={accessibleLabel}
    >
      <WebView
        source={source}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        nestedScrollEnabled
        overScrollMode="never"
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
        onMessage={handleMessage}
        style={{ flex: 1, backgroundColor: surface }}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      />

      <View pointerEvents="none" className="absolute left-2 top-2">
        {routeSummary ? (
          <View className="flex-row items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1">
            <Ionicons name="navigate" size={12} color={tokens.accent} />
            <Text variant="caption" weight="semibold">
              {formatDistance(routeSummary.distanceMeters)} ·{' '}
              {formatDuration(routeSummary.durationSeconds)}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-3 rounded-full bg-background/90 px-2.5 py-1">
            <LegendDot color={tokens.primary} label="You" />
            <LegendDot color={tokens.accent} label="Customer" />
          </View>
        )}
      </View>

      {!isReady ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center bg-surface-variant/60"
        >
          <ActivityIndicator color={tokens.primary} />
        </View>
      ) : null}
    </View>
  );
}
