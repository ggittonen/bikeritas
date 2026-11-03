import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import type { Coordinate } from '@/domain/types';
import { colors } from '@/theme';

export type BikeMapProps = {
  position: Coordinate | null;
  parkedAt?: Coordinate | null;
  path?: Coordinate[];
  style?: StyleProp<ViewStyle>;
};

const DELTA = { latitudeDelta: 0.008, longitudeDelta: 0.008 };

export function BikeMap({ position, parkedAt, path, style }: BikeMapProps) {
  const mapRef = useRef<MapView>(null);
  const lat = position?.latitude;
  const lon = position?.longitude;

  useEffect(() => {
    if (lat !== undefined && lon !== undefined) {
      mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, ...DELTA }, 500);
    }
  }, [lat, lon]);

  if (!position) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Odotetaan sijaintia…</Text>
      </View>
    );
  }

  return (
    <MapView ref={mapRef} style={style} initialRegion={{ ...position, ...DELTA }}>
      {parkedAt ? <Marker coordinate={parkedAt} title="Pysäköity" pinColor="green" /> : null}
      {path && path.length > 1 ? (
        <Polyline coordinates={path} strokeColor={colors.danger} strokeWidth={4} />
      ) : null}
      <Marker coordinate={position} title="Pyörä" />
    </MapView>
  );
}

const styles = StyleSheet.create({
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border },
  placeholderText: { color: colors.muted },
});
