import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BikeMap } from '@/components/BikeMap';
import { useI18n } from '@/i18n/LanguageContext';
import { useBike } from '@/state/BikeContext';
import { colors, spacing } from '@/theme';

/** Location tab: full-screen map of where the bike is right now. */
export default function LocationScreen() {
  const { s } = useI18n();
  const { tag, armed, parkedAt, incident } = useBike();

  return (
    <View style={styles.screen}>
      <BikeMap
        position={tag?.lastFix ?? null}
        parkedAt={armed ? parkedAt : null}
        path={incident?.path}
        label={s.common.bikeLocation}
        style={styles.map}
      />

      {incident ? (
        <Link href="/alert" asChild>
          <Pressable style={styles.alertBar}>
            <AppText bold upper size={18} color={colors.danger}>
              {s.location.alertTitle}
            </AppText>
            <AppText upper>{s.location.alertBody}</AppText>
          </Pressable>
        </Link>
      ) : (
        <View style={styles.statusBar} pointerEvents="none">
          <View style={[styles.statusDot, { backgroundColor: armed ? colors.success : colors.muted }]} />
          <AppText upper size={13}>
            {armed ? s.monitoring.on : s.monitoring.off}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  map: { flex: 1 },
  alertBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.chrome,
    borderWidth: 3,
    borderColor: colors.danger,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    zIndex: 1000,
  },
  statusBar: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#111',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    zIndex: 1000,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});
