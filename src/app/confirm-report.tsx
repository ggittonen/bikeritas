import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { Card, Row } from '@/components/Card';
import type { BikeProfile } from '@/domain/types';
import { useI18n } from '@/i18n/LanguageContext';
import type { Strings } from '@/i18n/strings';
import { useBike } from '@/state/BikeContext';
import { colors, spacing } from '@/theme';

const hasDetails = (p: BikeProfile) =>
  Boolean(p.make || p.model || p.color || p.frameNumber || p.photos.length || p.receiptUri);

/**
 * Opens after "I suspect theft". Testers wanted control: nothing goes to
 * customer service or the police until the owner sees what is shared and confirms.
 * Without a subscription it helps the owner file the police report themselves.
 */
export default function ConfirmReportScreen() {
  const { s } = useI18n();
  const { incident, profile, subscriptionActive, reportTheft, logSelfReport } = useBike();
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!incident) {
    return (
      <View style={styles.content}>
        <AppText upper>{s.alert.none}</AppText>
        <BigButton title={s.common.back} onPress={() => router.back()} />
      </View>
    );
  }

  const onConfirm = async () => {
    setSending(true);
    setFailed(false);
    const result = await reportTheft();
    setSending(false);
    if (result === 'failed') setFailed(true);
    else router.dismissTo('/incident');
  };

  const onOpenPoliceForm = () => {
    logSelfReport();
    Linking.openURL(s.confirm.policeUrl);
  };

  if (!subscriptionActive) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <AppText bold upper size={22}>
          {s.confirm.selfTitle}
        </AppText>
        <AppText size={14} style={styles.body}>
          {s.confirm.selfBody}
        </AppText>
        <BigButton title={s.confirm.openPoliceForm} onPress={onOpenPoliceForm} />
        <ProfileCard s={s} profile={profile} />
        <AppText size={13} color={colors.muted}>
          {s.confirm.upsell}
        </AppText>
        <BigButton title={s.confirm.getSubscription} variant="secondary" onPress={() => router.navigate('/more')} />
        <BigButton title={s.confirm.cancel} variant="secondary" onPress={() => router.back()} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <AppText bold upper size={22}>
        {s.confirm.title}
      </AppText>
      <AppText size={14} style={styles.body}>
        {s.confirm.intro}
      </AppText>

      <Card title={s.confirm.sharedTitle}>
        <AppText size={14}>• {s.confirm.location}</AppText>
      </Card>
      <ProfileCard s={s} profile={profile} />

      <Card title={s.confirm.recipientsTitle}>
        {s.confirm.recipients.map((r) => (
          <AppText key={r} size={14}>
            • {r}
          </AppText>
        ))}
      </Card>

      {failed ? <AppText color={colors.danger}>{s.alert.failed}</AppText> : null}

      <BigButton title={s.confirm.confirm} variant="danger" onPress={onConfirm} loading={sending} />
      <BigButton title={s.confirm.cancel} variant="secondary" onPress={() => router.back()} />
    </ScrollView>
  );
}

function ProfileCard({ s, profile }: { s: Strings; profile: BikeProfile }) {
  if (!hasDetails(profile)) {
    return (
      <Card title={s.confirm.bikeDetails}>
        <AppText size={14} color={colors.warning}>
          {s.confirm.missingDetails}
        </AppText>
        <BigButton title={s.confirm.addDetails} variant="secondary" onPress={() => router.push('/bike-setup')} />
      </Card>
    );
  }
  return (
    <Card title={s.confirm.bikeDetails}>
      <Row label={s.setup.make} value={profile.make || '–'} />
      <Row label={s.setup.model} value={profile.model || '–'} />
      <Row label={s.setup.color} value={profile.color || '–'} />
      <Row label={s.setup.frameNumber} value={profile.frameNumber || '–'} />
      <Row label={s.confirm.receipt} value={profile.receiptUri ? s.common.yes : s.common.no} />
      <AppText size={13} color={colors.muted}>
        {s.confirm.photos(profile.photos.length)}
      </AppText>
      {profile.photos.length ? (
        <View style={styles.thumbs}>
          {profile.photos.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.thumb} />
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  body: { lineHeight: 21 },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumb: { width: 72, height: 72, backgroundColor: colors.surface },
});
