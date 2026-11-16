import { router } from 'expo-router';
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
  const { incident, tag, dismissIncident } = useBike();

  if (!incident) {
    return (
      <View style={[styles.content, styles.center]}>
        <AppText upper>{s.alert.none}</AppText>
        <BigButton title={s.common.back} onPress={() => router.back()} />
      </View>
    );
  }

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
          // Nothing is sent yet: the next screen shows what would be shared and asks to confirm.
          onPress={() => router.push('/confirm-report')}
          disabled={reported}
          style={styles.choice}
        />
      </View>
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
