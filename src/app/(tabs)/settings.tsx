import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card, Row } from '@/components/Card';
import { formatPercent } from '@/format';
import { useBike } from '@/state/BikeContext';
import { colors, spacing } from '@/theme';

export default function SettingsScreen() {
  const { tag, subscriptionActive, setSubscription } = useBike();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card title="Bikeritas Turva">
        <Text style={styles.body}>
          Kuukausitilaus aktivoi asiakaspalvelun: varkaustilanteessa se ilmoittaa poliisille, tekee
          rikos- ja vakuutusilmoituksen puolestasi ja välittää pyörän reaaliaikaisen sijainnin
          viranomaisille.
        </Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{subscriptionActive ? 'Tilaus aktiivinen' : 'Ei tilausta'}</Text>
          <Switch value={subscriptionActive} onValueChange={setSubscription} />
        </View>
        <Text style={styles.note}>Prototyyppi: maksua ei veloiteta, kytkin vain simuloi tilausta.</Text>
      </Card>

      <Card title="Tägi">
        <Row label="Nimi" value={tag?.name ?? '–'} />
        <Row label="Tunniste" value={tag?.id ?? '–'} />
        <Row label="Akku" value={tag ? formatPercent(tag.batteryPercent) : '–'} />
        <Row label="Lataus" value={tag?.charging ? 'Latautuu' : 'Ei latauksessa'} />
        <Text style={styles.note}>
          Reaaliaikainen seuranta kuluttaa akkua, joten lataa tägi latausjohdolla säännöllisesti.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  body: { color: colors.text, fontSize: 15, lineHeight: 21 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  note: { color: colors.muted, fontSize: 13 },
});
