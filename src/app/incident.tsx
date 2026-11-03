import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { BikeMap } from '@/components/BikeMap';
import { Card, Row } from '@/components/Card';
import { formatTime } from '@/format';
import { useBike } from '@/state/BikeContext';
import { colors, spacing } from '@/theme';

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
        <AppText upper>Ei aktiivista tapausta.</AppText>
        <BigButton title="Etusivulle" onPress={() => router.dismissTo('/')} />
      </View>
    );
  }

  const onRecovered = () => {
    markRecovered();
    router.dismissTo('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BikeMap position={fix} path={incident.path} label="Pyörän sijainti" style={styles.map} />

      <Card title="Tilanne">
        <Row label="Tila" value={STATUS_LABEL[incident.status]} />
        <Row label="Nopeus" value={fix ? `${Math.round(fix.speedKmh)} km/h` : '–'} />
        <Row label="Viimeisin sijainti" value={fix ? formatTime(fix.timestamp) : '–'} />
        {incident.supportCaseId ? <Row label="Tapausnumero" value={incident.supportCaseId} /> : null}
      </Card>

      <Card title="Tapahtumat">
        {incident.timeline.map((event, i) => (
          <View key={i} style={styles.event}>
            <AppText size={13} color={colors.muted}>
              {formatTime(event.at)}
            </AppText>
            <AppText size={14} style={styles.eventText}>
              {event.message}
            </AppText>
          </View>
        ))}
      </Card>

      {incident.status === 'detected' ? (
        <BigButton title="Epäilen varkautta" variant="danger" onPress={() => router.push('/alert')} />
      ) : null}
      <BigButton title="Pyörä saatu takaisin" onPress={onRecovered} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  map: { height: 320 },
  event: { flexDirection: 'row', gap: spacing.sm },
  eventText: { flexShrink: 1 },
});
