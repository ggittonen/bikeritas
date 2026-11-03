import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';
import type { BikeMapProps } from './BikeMap';

/** react-native-maps has no web support; show coordinates and an OpenStreetMap link instead. */
export function BikeMap({ position, path, style }: BikeMapProps) {
  if (!position) {
    return (
      <View style={[styles.box, style]}>
        <Text style={styles.muted}>Odotetaan sijaintia…</Text>
      </View>
    );
  }
  const { latitude, longitude } = position;
  const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
  return (
    <View style={[styles.box, style]}>
      <Text style={styles.coords}>
        {latitude.toFixed(5)}, {longitude.toFixed(5)}
      </Text>
      {path && path.length > 1 ? <Text style={styles.muted}>{path.length} sijaintipistettä reitillä</Text> : null}
      <Pressable onPress={() => Linking.openURL(url)}>
        <Text style={styles.link}>Avaa kartalla</Text>
      </Pressable>
      <Text style={styles.muted}>(Karttanäkymä toimii puhelimella)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.border },
  coords: { fontSize: 18, fontWeight: '600', color: colors.text },
  muted: { color: colors.muted },
  link: { color: colors.primary, fontSize: 16, fontWeight: '600' },
});
