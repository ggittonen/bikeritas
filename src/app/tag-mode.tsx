import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { Card, Row } from '@/components/Card';
import type { TagStatus } from '@/domain/types';
import { formatPercent, formatTime } from '@/format';
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
  const [bikeId, setBikeId] = useState<string | null>(null);
  const [status, setStatus] = useState<TagStatus | null>(null);
  const [lastSent, setLastSent] = useState<number | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

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
      publishTagStatus(bikeId, { ...next, name: 'Oma pyörä' })
        .then(() => {
          setLastSent(Date.now());
          setSendError(null);
        })
        .catch(() => setSendError('Lähetys epäonnistui – tarkista verkkoyhteys.'));
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
          Backend puuttuu
        </AppText>
        <AppText>
          Tägitila tarvitsee Firebasen. Lisää asetukset tiedostoon .env.local (ohje README:ssä) ja
          käynnistä palvelin uudelleen.
        </AppText>
        <BigButton title="Takaisin" onPress={() => router.back()} />
      </View>
    );
  }

  const fix = status?.lastFix ?? null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.center}>
        <AppText upper color={colors.muted}>
          Tämä puhelin on pyörän tägi
        </AppText>
        <AppText upper color={colors.muted} size={13}>
          Syötä koodi omistajan puhelimeen
        </AppText>
        <AppText bold size={40} style={styles.code} selectable>
          {bikeId ? formatBikeId(bikeId) : '…'}
        </AppText>
      </View>

      <Card title="Tila">
        <Row label="GPS" value={fix ? 'OK' : 'Odotetaan…'} />
        <Row label="Viimeisin sijainti" value={fix ? formatTime(fix.timestamp) : '–'} />
        <Row label="Lähetetty" value={lastSent ? formatTime(lastSent) : '–'} />
        <Row
          label="Akku"
          value={status?.batteryPercent != null ? formatPercent(status.batteryPercent) : '–'}
        />
        {status?.error ? <AppText color={colors.warning}>{status.error}</AppText> : null}
        {sendError ? <AppText color={colors.danger}>{sendError}</AppText> : null}
      </Card>

      <AppText size={13} color={colors.muted}>
        Pidä sovellus auki tässä näkymässä. Näyttö pysyy päällä automaattisesti. Laita puhelin
        pyörän laukkuun.
      </AppText>

      <BigButton title="Lopeta tägitila" variant="secondary" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg },
  center: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  code: { letterSpacing: 4, marginTop: spacing.md },
});
