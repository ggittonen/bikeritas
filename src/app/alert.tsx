import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { BigButton } from '@/components/BigButton';
import { BikeMap } from '@/components/BikeMap';
import { useI18n } from '@/i18n/LanguageContext';
import { useBike } from '@/state/BikeContext';
import { colors, spacing } from '@/theme';

/** Shown the moment unauthorized movement is detected: two big, obvious choices. */
export default function AlertScreen() {
  const { s } = useI18n();
  const { incident, tag, reportTheft, dismissIncident } = useBike();
  const [reporting, setReporting] = useState(false);
  // Shown inline rather than with Alert.alert, which does nothing on web.
  const [message, setMessage] = useState<'needSubscription' | 'failed' | null>(null);

  if (!incident) {
    return (
      <View style={[styles.content, styles.center]}>
        <AppText upper>{s.alert.none}</AppText>
        <BigButton title={s.common.back} onPress={() => router.back()} />
      </View>
    );
  }

  const onSuspectTheft = async () => {
    setMessage(null);
    setReporting(true);
    const result = await reportTheft();
    setReporting(false);
    if (result === 'no_subscription') {
      setMessage('needSubscription');
      return;
    }
    if (result === 'failed') {
      setMessage('failed');
      return;
    }
    router.replace('/incident');
  };

  const onNoWorries = () => {
    dismissIncident();
    router.back();
  };

  const reported = incident.status !== 'detected';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.center}>
        <AppText bold upper size={32} color={colors.danger}>
          {s.alert.title}
        </AppText>
        <AppText upper size={20} style={styles.centerText}>
          {s.alert.body}
        </AppText>
      </View>

      <BikeMap position={tag?.lastFix ?? null} path={incident.path} style={styles.map} />

      <Pressable onPress={() => router.replace('/incident')} style={styles.center}>
        <AppText upper size={18} style={styles.link}>
          {s.alert.openMap}
        </AppText>
      </Pressable>

      <View style={styles.choices}>
        <BigButton title={s.alert.noWorries} onPress={onNoWorries} style={styles.choice} />
        <BigButton
          title={reported ? s.alert.reported : s.alert.suspectTheft}
          onPress={onSuspectTheft}
          loading={reporting}
          disabled={reported}
          style={styles.choice}
        />
      </View>

      {message ? (
        <AppText color={colors.warning} style={styles.centerText}>
          {s.alert[message]}
        </AppText>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing.lg, gap: spacing.lg, justifyContent: 'center' },
  center: { alignItems: 'center', gap: spacing.md },
  centerText: { textAlign: 'center', lineHeight: 30 },
  map: { height: 150 },
  link: { textDecorationLine: 'underline' },
  choices: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  choice: { flex: 1, minHeight: 110 },
});
