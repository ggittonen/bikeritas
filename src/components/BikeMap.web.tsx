import type * as Leaflet from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';
import { AppText } from './AppText';
import type { BikeMapProps } from './BikeMap';
import { MapLabel } from './MapLabel';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

function ensureLeafletCss() {
  if (document.getElementById('leaflet-css')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = LEAFLET_CSS;
  document.head.appendChild(link);
}

type Layers = {
  map: Leaflet.Map;
  halo: Leaflet.CircleMarker;
  dot: Leaflet.CircleMarker;
  parked: Leaflet.CircleMarker;
  path: Leaflet.Polyline;
};

/** Browser version: react-native-maps has no web support, so draw an OpenStreetMap map with Leaflet. */
export function BikeMap({ position, parkedAt, path, label, style }: BikeMapProps) {
  // On web a View renders a <div>; Leaflet draws into it.
  const containerRef = useRef<HTMLElement | null>(null);
  const [layers, setLayers] = useState<Layers | null>(null);
  const hasPosition = position !== null;

  // Create the map once the first position is known. Leaflet is imported lazily
  // because it touches `window` at import time, which breaks server rendering.
  useEffect(() => {
    if (!hasPosition || !position) return;
    let cancelled = false;
    let map: Leaflet.Map | null = null;
    const start: Leaflet.LatLngTuple = [position.latitude, position.longitude];

    import('leaflet').then(({ default: L }) => {
      const el = containerRef.current;
      if (cancelled || !el) return;
      ensureLeafletCss();
      map = L.map(el, { zoomControl: false }).setView(start, 17);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map);
      const red = colors.danger;
      setLayers({
        map,
        path: L.polyline([], { color: red, weight: 4 }).addTo(map),
        parked: L.circleMarker(start, { radius: 7, color: colors.chrome, weight: 3, fillColor: '#fff', fillOpacity: 1 }),
        halo: L.circleMarker(start, { radius: 17, stroke: false, fillColor: red, fillOpacity: 0.3 }).addTo(map),
        dot: L.circleMarker(start, { radius: 7, stroke: false, fillColor: red, fillOpacity: 1 }).addTo(map),
      });
      setTimeout(() => map?.invalidateSize(), 0);
    });

    return () => {
      cancelled = true;
      map?.remove();
      setLayers(null);
    };
    // Only (re)create when a position first becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPosition]);

  // Keep markers, route and view in sync.
  useEffect(() => {
    if (!layers || !position) return;
    const here: Leaflet.LatLngTuple = [position.latitude, position.longitude];
    layers.dot.setLatLng(here);
    layers.halo.setLatLng(here);
    layers.path.setLatLngs((path ?? []).map((p) => [p.latitude, p.longitude] as Leaflet.LatLngTuple));
    if (parkedAt) layers.parked.setLatLng([parkedAt.latitude, parkedAt.longitude]).addTo(layers.map);
    else layers.parked.remove();
    layers.map.panTo(here);
  }, [layers, position, parkedAt, path]);

  return (
    <View style={[styles.container, style]}>
      <View
        ref={(node) => {
          containerRef.current = node as unknown as HTMLElement | null;
        }}
        style={StyleSheet.absoluteFill}
      />
      {position ? null : (
        <AppText upper color={colors.muted}>
          Odotetaan sijaintia…
        </AppText>
      )}
      {label ? <MapLabel text={label} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
