import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { Card, Row } from '@/components/Card';
import type { TagStatus } from '@/domain/types';
import { formatPercent, formatTime } from '@/format';
import { useI18n } from '@/i18n/LanguageContext';
import { formatBikeId, publishTagStatus } from '@/services/backend/bikeChannel';
import { backendConfigured } from '@/services/backend/firebase';
import { getOrCreateOwnTagId } from '@/services/backend/ownTagId';
import { PhoneLocationTagService } from '@/services/tag/PhoneLocationTagService';
import { colors, spacing } from '@/theme';

/**
 * Turns this phone into the bike's tag: reads GPS and sends every position to
 * the backend, where the owner's phone picks it up. Stand-in for the real tag.
 */
export default function TagModeScreen() {
  useKeepAwake(); // the screen must stay on, or the phone stops sending
  const { s } = useI18n();
  const [bikeId, setBikeId] = useState<string | null>(null);
  const [status, setStatus] = useState<TagStatus | null>(null);
  const [lastSent, setLastSent] = useState<number | null>(null);
  const [sendFailed, setSendFailed] = useState(false);

  useEffect(() => {
    getOrCreateOwnTagId().then(setBikeId);
  }, []);

  useEffect(() => {
    if (!bikeId || !backendConfigured) return;
    const gps = new PhoneLocationTagService();
    // undefined = nothing sent yet. The first status is sent even without a fix,
    // so the owner can pair before GPS is ready; after that, only new positions.
    let lastSentFix: number | null | undefined;
    gps.start();
    const unsubscribe = gps.subscribe((next) => {
      setStatus(next);
      const fixTime = next.lastFix?.timestamp ?? null;
      if (fixTime === lastSentFix) return;
      lastSentFix = fixTime;
      publishTagStatus(bikeId, { ...next, name: 'Bikeritas tag' })
        .then(() => {
          setLastSent(Date.now());
          setSendFailed(false);
        })
        .catch(() => setSendFailed(true));
    });
    return () => {
      unsubscribe();
      gps.stop();
    };
  }, [bikeId]);

  if (!backendConfigured) {
    return (
      <View style={styles.content}>
        <AppText bold upper size={20} color={colors.warning}>
          {s.tagMode.backendMissingTitle}
        </AppText>
        <AppText>{s.tagMode.backendMissingBody}</AppText>
        <BigButton title={s.common.back} onPress={() => router.back()} />
      </View>
    );
  }

  const fix = status?.lastFix ?? null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.center}>
        <AppText upper color={colors.muted}>
          {s.tagMode.thisPhoneIsTag}
        </AppText>
        <AppText upper color={colors.muted} size={13}>
          {s.tagMode.enterCode}
        </AppText>
        <AppText bold size={40} style={styles.code} selectable>
          {bikeId ? formatBikeId(bikeId) : '…'}
        </AppText>
      </View>

      <Card title={s.tagMode.status}>
        <Row label={s.tagMode.gps} value={fix ? 'OK' : s.tagMode.waiting} />
        <Row label={s.incident.lastLocation} value={fix ? formatTime(fix.timestamp, s.locale) : '–'} />
        <Row label={s.tagMode.sent} value={lastSent ? formatTime(lastSent, s.locale) : '–'} />
        <Row
          label={s.bikes.battery}
          value={status?.batteryPercent != null ? formatPercent(status.batteryPercent) : '–'}
        />
        {status?.problem ? <AppText color={colors.warning}>{s.tagProblem(status.problem)}</AppText> : null}
        {sendFailed ? <AppText color={colors.danger}>{s.tagMode.sendFailed}</AppText> : null}
      </Card>

      <AppText size={13} color={colors.muted}>
        {s.tagMode.keepOpen}
      </AppText>

      <BigButton title={s.tagMode.stop} variant="secondary" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg },
  center: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  code: { letterSpacing: 4, marginTop: spacing.md },
});
