import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { BikeMap } from '@/components/BikeMap';
import { Card, Row } from '@/components/Card';
import type { ReportStage } from '@/domain/types';
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

      {incident.progress ? (
        <Card title={s.incident.progressTitle}>
          <ProgressRow label={s.incident.crimeReport} stage={incident.progress.crimeReport} />
          {incident.progress.insuranceClaim ? (
            <ProgressRow label={s.incident.insuranceClaim} stage={incident.progress.insuranceClaim} />
          ) : null}
        </Card>
      ) : null}

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
        <BigButton
          title={s.alert.suspectTheft}
          variant="danger"
          onPress={() => router.push('/confirm-report')}
        />
      ) : null}
      <BigButton title={s.incident.recovered} onPress={onRecovered} />
    </ScrollView>
  );
}

const STAGES: ReportStage[] = ['sent', 'received', 'processing', 'done'];

/** One report's progress: label, current stage, and four step marks. */
function ProgressRow({ label, stage }: { label: string; stage: ReportStage }) {
  const { s } = useI18n();
  const reached = STAGES.indexOf(stage);
  return (
    <View style={styles.progress}>
      <View style={styles.progressHeader}>
        <AppText upper size={13} color={colors.muted}>
          {label}
        </AppText>
        <AppText size={14} color={stage === 'done' ? colors.success : colors.text}>
          {s.incident.stages[stage]}
        </AppText>
      </View>
      <View style={styles.steps}>
        {STAGES.map((st, i) => (
          <View
            key={st}
            style={[styles.step, { backgroundColor: i <= reached ? colors.success : colors.divider }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: { gap: spacing.xs },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  steps: { flexDirection: 'row', gap: 4 },
  step: { flex: 1, height: 6 },
  content: { padding: spacing.md, gap: spacing.md },
  map: { height: 320 },
  event: { flexDirection: 'row', gap: spacing.sm },
  eventText: { flexShrink: 1 },
});
