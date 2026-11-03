import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BigButton } from '@/components/BigButton';
import { BikeMap } from '@/components/BikeMap';
import { useBike } from '@/state/BikeContext';
import { colors, radius, spacing } from '@/theme';

/** Shown the moment unauthorized movement is detected: few, big, obvious choices. */
export default function AlertScreen() {
  const { incident, tag, reportTheft, dismissIncident } = useBike();
  const [reporting, setReporting] = useState(false);

  if (!incident) {
    return (
      <View style={[styles.content, styles.center]}>
        <Text style={styles.body}>Ei aktiivisia hälytyksiä.</Text>
        <BigButton title="Takaisin" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const onReport = async () => {
    setReporting(true);
    const result = await reportTheft();
    setReporting(false);
    if (result === 'no_subscription') {
      Alert.alert(
        'Bikeritas Turva tarvitaan',
        'Poliisi-ilmoitus asiakaspalvelun kautta sisältyy kuukausitilaukseen. Voit aktivoida sen asetuksista.',
      );
      return;
    }
    if (result === 'failed') {
      Alert.alert('Ilmoitus epäonnistui', 'Tarkista verkkoyhteys ja yritä uudelleen.');
      return;
    }
    router.replace('/incident');
  };

  const onItWasMe = () => {
    dismissIncident();
    router.back();
  };

  return (
    <View style={styles.content}>
      <View>
        <Text style={styles.title}>Pyöräsi liikkuu!</Text>
        <Text style={styles.body}>Valvonta havaitsi liikettä pysäköintipaikalta. Mitä tehdään?</Text>
      </View>

      <BikeMap position={tag?.lastFix ?? null} path={incident.path} style={styles.map} />

      <View style={styles.actions}>
        {incident.status === 'detected' ? (
          <BigButton title="Ilmoita poliisille" variant="danger" onPress={onReport} loading={reporting} />
        ) : null}
        <BigButton title="Seuraa pyörää" onPress={() => router.replace('/incident')} />
        <BigButton title="Se olin minä" variant="secondary" onPress={onItWasMe} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing.md, gap: spacing.md },
  center: { justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.danger },
  body: { fontSize: 16, color: colors.text, marginTop: spacing.xs },
  map: { flex: 1, minHeight: 200, borderRadius: radius.md, overflow: 'hidden' },
  actions: { gap: spacing.sm },
});
