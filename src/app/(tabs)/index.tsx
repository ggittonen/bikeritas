import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BikeMap } from '@/components/BikeMap';
import { formatTime } from '@/format';
import { useI18n } from '@/i18n/LanguageContext';
import { useBike } from '@/state/BikeContext';
import { colors, spacing } from '@/theme';

/** Location tab: full-screen map of where the bike is right now. */
export default function LocationScreen() {
  const { s } = useI18n();
  const { tag, armed, parkedAt, incident, arm, disarm } = useBike();
  const fix = tag?.lastFix ?? null;
  // Connection lost: keep showing where the bike was last seen, and say so.
  const label =
    fix && tag && !tag.connected ? s.common.lastKnown(formatTime(fix.timestamp, s.locale)) : s.common.bikeLocation;

  return (
    <View style={styles.screen}>
      <BikeMap position={fix} parkedAt={armed ? parkedAt : null} path={incident?.path} label={label} style={styles.map} />

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
        // Monitoring can be toggled right from the map (testers liked the quick switch).
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: armed }}
          onPress={armed ? disarm : arm}
          disabled={!fix}
          style={({ pressed }) => [styles.toggle, pressed && styles.pressed, !fix && styles.disabled]}
        >
          <View style={[styles.statusDot, { backgroundColor: armed ? colors.success : colors.muted }]} />
          <AppText upper size={14}>
            {armed ? s.monitoring.on : s.monitoring.off}
          </AppText>
          <AppText upper size={12} color={colors.muted} style={styles.hint}>
            {armed ? s.monitoring.turnOff : s.monitoring.turnOn}
          </AppText>
        </Pressable>
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
  toggle: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    zIndex: 1000,
  },
  pressed: { backgroundColor: '#222' },
  disabled: { opacity: 0.5 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  hint: { marginLeft: 'auto', flexShrink: 1, textAlign: 'right' },
});
