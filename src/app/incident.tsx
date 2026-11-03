import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/BigButton';
import { BikeMap } from '@/components/BikeMap';
import { Card, Row } from '@/components/Card';
import { formatTime } from '@/format';
import { useBike } from '@/state/BikeContext';
import { colors, radius, spacing } from '@/theme';

const STATUS_LABEL = {
  detected: 'Ei vielä ilmoitettu',
  reporting: 'Ilmoitetaan…',
  police_notified: 'Poliisi tietää',
} as const;

export default function IncidentScreen() {
  const { incident, tag, markRecovered } = useBike();
  const fix = tag?.lastFix ?? null;

  if (!incident) {
    return (
      <View style={styles.content}>
        <Text style={styles.body}>Ei aktiivista tapausta.</Text>
        <BigButton title="Etusivulle" variant="secondary" onPress={() => router.dismissTo('/')} />
      </View>
    );
  }

  const onRecovered = () => {
    markRecovered();
    router.dismissTo('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BikeMap position={fix} path={incident.path} style={styles.map} />

      <Card title="Tilanne">
        <Row label="Tila" value={STATUS_LABEL[incident.status]} />
        <Row label="Nopeus" value={fix ? `${Math.round(fix.speedKmh)} km/h` : '–'} />
        <Row label="Viimeisin sijainti" value={fix ? formatTime(fix.timestamp) : '–'} />
        {incident.supportCaseId ? <Row label="Tapausnumero" value={incident.supportCaseId} /> : null}
      </Card>

      <Card title="Tapahtumat">
        {incident.timeline.map((event, i) => (
          <View key={i} style={styles.event}>
            <Text style={styles.eventTime}>{formatTime(event.at)}</Text>
            <Text style={styles.body}>{event.message}</Text>
          </View>
        ))}
      </Card>

      {incident.status === 'detected' ? (
        <BigButton title="Ilmoita poliisille" variant="danger" onPress={() => router.push('/alert')} />
      ) : null}
      <BigButton title="Pyörä saatu takaisin" variant="secondary" onPress={onRecovered} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  map: { height: 300, borderRadius: radius.md, overflow: 'hidden' },
  body: { fontSize: 15, color: colors.text, flexShrink: 1 },
  event: { flexDirection: 'row', gap: spacing.sm },
  eventTime: { color: colors.muted, fontVariant: ['tabular-nums'] },
});
