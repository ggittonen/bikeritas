import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { Card, Row } from '@/components/Card';
import { BikeIcon } from '@/components/icons';
import { distanceMeters } from '@/domain/geo';
import { MOVEMENT_THRESHOLD_M } from '@/domain/movementDetection';
import { formatPercent, formatTime } from '@/format';
import { tagSimulator } from '@/services';
import { useBike } from '@/state/BikeContext';
import { colors, spacing } from '@/theme';

const LOW_BATTERY_PERCENT = 20;

/** "Pyörät" tab: the bike, its tag and turning monitoring on/off. */
export default function BikesScreen() {
  const { tag, tagSource, armed, parkedAt, incident, arm, disarm } = useBike();
  const fix = tag?.lastFix ?? null;
  const battery = tag?.batteryPercent ?? null;
  const lowBattery = battery !== null && battery < LOW_BATTERY_PERCENT;
  const distance = armed && parkedAt && fix ? distanceMeters(parkedAt, fix) : null;
  const simulatorMoving = tagSource === 'simulator' && (fix?.speedKmh ?? 0) > 0;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <BikeIcon size={56} />
        <AppText upper size={20}>
          {tag?.name ?? 'Oma pyörä'}
        </AppText>
        <AppText upper bold color={armed ? colors.success : colors.muted}>
          {armed ? 'Valvonta päällä' : 'Valvonta pois'}
        </AppText>
      </View>

      {incident ? null : (
        <>
          <BigButton
            title={armed ? 'Poista valvonta' : 'Aktivoi valvonta'}
            variant={armed ? 'secondary' : 'primary'}
            onPress={armed ? disarm : arm}
            disabled={!fix}
          />
          <AppText color={colors.muted} size={13} style={styles.center}>
            Saat hälytyksen, jos pyörä liikkuu yli {MOVEMENT_THRESHOLD_M} m pysäköintipaikasta.
          </AppText>
        </>
      )}

      <Card title="Tägi">
        <Row label="Yhteys" value={tag?.connected ? 'Yhdistetty' : 'Ei yhteyttä'} />
        <Row label="Akku" value={battery !== null ? formatPercent(battery) : '–'} />
        <Row label="Päivitetty" value={fix ? formatTime(fix.timestamp) : '–'} />
        {distance !== null ? (
          <Row label="Etäisyys pysäköinnistä" value={`${Math.round(distance)}/${MOVEMENT_THRESHOLD_M} m`} />
        ) : null}
        {tag?.error ? <AppText color={colors.warning}>{tag.error}</AppText> : null}
        {lowBattery ? <AppText color={colors.warning}>Akku vähissä – lataa tägi johdolla.</AppText> : null}
      </Card>

      {__DEV__ && tagSource === 'simulator' ? (
        <Card title="Testaustila">
          <BigButton
            title={simulatorMoving ? 'Pysäytä pyörä' : 'Simuloi varkaus'}
            variant="secondary"
            onPress={simulatorMoving ? tagSimulator.stopMovement : tagSimulator.simulateTheft}
          />
          <AppText color={colors.muted} size={13}>
            {simulatorMoving
              ? 'Pyörä liikkuu…'
              : armed
                ? 'Hälytys tulee, kun pyörä on yli rajan päässä (noin 10 s).'
                : 'Aktivoi valvonta ensin, muuten varkaus ei hälytä.'}
          </AppText>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  center: { textAlign: 'center' },
});
