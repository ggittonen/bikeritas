import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/BigButton';
import { BikeMap } from '@/components/BikeMap';
import { Card, Row } from '@/components/Card';
import { MOVEMENT_THRESHOLD_M } from '@/domain/movementDetection';
import { formatPercent, formatTime } from '@/format';
import { tagSimulator } from '@/services';
import { useBike } from '@/state/BikeContext';
import { colors, radius, spacing } from '@/theme';

const LOW_BATTERY_PERCENT = 20;

export default function HomeScreen() {
  const { tag, armed, parkedAt, incident, arm, disarm } = useBike();
  const fix = tag?.lastFix ?? null;
  const lowBattery = tag !== null && tag.batteryPercent < LOW_BATTERY_PERCENT;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {incident ? (
        <Link href="/incident" asChild>
          <Pressable style={styles.alertBanner}>
            <Text style={styles.alertTitle}>Pyöräsi liikkuu!</Text>
            <Text style={styles.alertBody}>Napauta nähdäksesi sijainnin ja tilanteen</Text>
          </Pressable>
        </Link>
      ) : null}

      <BikeMap position={fix} parkedAt={armed ? parkedAt : null} path={incident?.path} style={styles.map} />

      <View style={[styles.statusPill, { backgroundColor: armed ? colors.success : colors.muted }]}>
        <Text style={styles.statusText}>{armed ? 'Valvonta päällä' : 'Valvonta pois'}</Text>
      </View>

      {incident ? null : (
        <>
          <BigButton
            title={armed ? 'Poista valvonta' : 'Aktivoi valvonta'}
            variant={armed ? 'secondary' : 'primary'}
            onPress={armed ? disarm : arm}
            disabled={!fix}
          />
          <Text style={styles.hint}>
            Saat hälytyksen, jos pyörä liikkuu yli {MOVEMENT_THRESHOLD_M} m pysäköintipaikasta.
          </Text>
        </>
      )}

      <Card title={tag?.name ?? 'Tägi'}>
        <Row label="Yhteys" value={tag?.connected ? 'Yhdistetty' : 'Ei yhteyttä'} />
        <Row label="Akku" value={tag ? formatPercent(tag.batteryPercent) : '–'} />
        <Row label="Päivitetty" value={fix ? formatTime(fix.timestamp) : '–'} />
        {lowBattery ? <Text style={styles.warning}>Akku vähissä – lataa tägi johdolla.</Text> : null}
      </Card>

      {__DEV__ && tagSimulator ? (
        <Card title="Testaustila">
          <BigButton title="Simuloi varkaus" variant="secondary" onPress={tagSimulator.simulateTheft} />
          <BigButton title="Pysäytä pyörä" variant="secondary" onPress={tagSimulator.stopMovement} />
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  map: { height: 280, borderRadius: radius.md, overflow: 'hidden' },
  alertBanner: { backgroundColor: colors.danger, borderRadius: radius.md, padding: spacing.md },
  alertTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  alertBody: { color: '#fff', marginTop: spacing.xs },
  statusPill: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hint: { color: colors.muted, textAlign: 'center' },
  warning: { color: colors.warning, fontWeight: '600' },
});
