import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { BikeMap } from '@/components/BikeMap';
import { Card, Row } from '@/components/Card';
import { formatTime } from '@/format';
import { useI18n } from '@/i18n/LanguageContext';
import { useBike } from '@/state/BikeContext';
import { colors, spacing } from '@/theme';

export default function IncidentScreen() {
  const { s } = useI18n();
  const { incident, tag, markRecovered } = useBike();
  const fix = tag?.lastFix ?? null;

  if (!incident) {
    return (
      <View style={styles.content}>
        <AppText upper>{s.incident.none}</AppText>
        <BigButton title={s.common.home} onPress={() => router.dismissTo('/')} />
      </View>
    );
  }

  const onRecovered = () => {
    markRecovered();
    router.dismissTo('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BikeMap position={fix} path={incident.path} label={s.common.bikeLocation} style={styles.map} />

      <Card title={s.incident.situation}>
        <Row label={s.incident.state} value={s.incident.statuses[incident.status]} />
        <Row label={s.incident.speed} value={fix ? `${Math.round(fix.speedKmh)} km/h` : '–'} />
        <Row label={s.incident.lastLocation} value={fix ? formatTime(fix.timestamp, s.locale) : '–'} />
        {incident.supportCaseId ? <Row label={s.incident.caseNumber} value={incident.supportCaseId} /> : null}
      </Card>

      <Card title={s.incident.events}>
        {incident.timeline.map((event, i) => (
          <View key={i} style={styles.event}>
            <AppText size={13} color={colors.muted}>
              {formatTime(event.at, s.locale)}
            </AppText>
            <AppText size={14} style={styles.eventText}>
              {s.incident.event(event)}
            </AppText>
          </View>
        ))}
      </Card>

      {incident.status === 'detected' ? (
        <BigButton title={s.alert.suspectTheft} variant="danger" onPress={() => router.push('/alert')} />
      ) : null}
      <BigButton title={s.incident.recovered} onPress={onRecovered} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  map: { height: 320 },
  event: { flexDirection: 'row', gap: spacing.sm },
  eventText: { flexShrink: 1 },
});
