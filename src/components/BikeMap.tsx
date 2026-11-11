import { useEffect, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import type { Coordinate } from '@/domain/types';
import { useI18n } from '@/i18n/LanguageContext';
import { colors } from '@/theme';
import { AppText } from './AppText';
import { MapLabel } from './MapLabel';

export type BikeMapProps = {
  position: Coordinate | null;
  parkedAt?: Coordinate | null;
  path?: Coordinate[];
  /** Black caption box in the top-left corner, e.g. "Pyörän sijainti". */
  label?: string;
  style?: StyleProp<ViewStyle>;
};

const DELTA = { latitudeDelta: 0.004, longitudeDelta: 0.004 };

export function BikeMap({ position, parkedAt, path, label, style }: BikeMapProps) {
  const { s } = useI18n();
  const mapRef = useRef<MapView>(null);
  const lat = position?.latitude;
  const lon = position?.longitude;

  useEffect(() => {
    if (lat !== undefined && lon !== undefined) {
      mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, ...DELTA }, 500);
    }
  }, [lat, lon]);

  return (
    <View style={[styles.container, style]}>
      {position ? (
        <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={{ ...position, ...DELTA }}>
          {path && path.length > 1 ? (
            <Polyline coordinates={path} strokeColor={colors.danger} strokeWidth={4} />
          ) : null}
          {parkedAt ? (
            <Marker coordinate={parkedAt} anchor={{ x: 0.5, y: 0.5 }} title={s.common.parked}>
              <View style={styles.parkedDot} />
            </Marker>
          ) : null}
          <Marker coordinate={position} anchor={{ x: 0.5, y: 0.5 }} title={s.common.bike}>
            <View style={styles.halo}>
              <View style={styles.dot} />
            </View>
          </Marker>
        </MapView>
      ) : (
        <AppText upper color={colors.muted}>
          {s.common.waitingForLocation}
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
  halo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(229,72,77,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.danger },
  parkedDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: colors.chrome,
  },
});
