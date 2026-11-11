import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { Card, Row } from '@/components/Card';
import { BikeIcon } from '@/components/icons';
import { distanceMeters } from '@/domain/geo';
import { MOVEMENT_THRESHOLD_M } from '@/domain/movementDetection';
import { formatPercent, formatTime } from '@/format';
import { useI18n } from '@/i18n/LanguageContext';
import { tagSimulator } from '@/services';
import { useBike } from '@/state/BikeContext';
import { colors, spacing } from '@/theme';

const LOW_BATTERY_PERCENT = 20;

/** Bikes tab: the bike, its tag and turning monitoring on/off. */
export default function BikesScreen() {
  const { s } = useI18n();
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
          {s.common.myBike}
        </AppText>
        <AppText upper bold color={armed ? colors.success : colors.muted}>
          {armed ? s.monitoring.on : s.monitoring.off}
        </AppText>
      </View>

      {incident ? null : (
        <>
          <BigButton
            title={armed ? s.monitoring.turnOff : s.monitoring.turnOn}
            variant={armed ? 'secondary' : 'primary'}
            onPress={armed ? disarm : arm}
            disabled={!fix}
          />
          <AppText color={colors.muted} size={13} style={styles.center}>
            {s.monitoring.hint(MOVEMENT_THRESHOLD_M)}
          </AppText>
        </>
      )}

      <Card title={s.bikes.tag}>
        <Row label={s.bikes.connection} value={tag?.connected ? s.bikes.connected : s.bikes.disconnected} />
        <Row label={s.bikes.battery} value={battery !== null ? formatPercent(battery) : '–'} />
        <Row label={s.bikes.updated} value={fix ? formatTime(fix.timestamp, s.locale) : '–'} />
        {distance !== null ? (
          <Row label={s.bikes.distance} value={`${Math.round(distance)}/${MOVEMENT_THRESHOLD_M} m`} />
        ) : null}
        {tag?.problem ? <AppText color={colors.warning}>{s.tagProblem(tag.problem)}</AppText> : null}
        {lowBattery ? <AppText color={colors.warning}>{s.bikes.lowBattery}</AppText> : null}
      </Card>

      {__DEV__ && tagSource === 'simulator' ? (
        <Card title={s.bikes.testMode}>
          <BigButton
            title={simulatorMoving ? s.bikes.stopBike : s.bikes.simulateTheft}
            variant="secondary"
            onPress={simulatorMoving ? tagSimulator.stopMovement : tagSimulator.simulateTheft}
          />
          <AppText color={colors.muted} size={13}>
            {simulatorMoving ? s.bikes.moving : armed ? s.bikes.willAlert : s.bikes.armFirst}
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
