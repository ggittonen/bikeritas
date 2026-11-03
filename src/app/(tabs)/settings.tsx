import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Card, Row } from '@/components/Card';
import { formatPercent } from '@/format';
import { tagSourceLabels, type TagSourceId } from '@/services';
import { useBike } from '@/state/BikeContext';
import { colors, radius, spacing } from '@/theme';

const sourceIds = Object.keys(tagSourceLabels) as TagSourceId[];

export default function SettingsScreen() {
  const { tag, tagSource, setTagSource, subscriptionActive, setSubscription } = useBike();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card title="Sijainnin lähde">
        {sourceIds.map((id) => {
          const selected = id === tagSource;
          return (
            <Pressable
              key={id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setTagSource(id)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={styles.switchLabel}>
                {selected ? '● ' : '○ '}
                {tagSourceLabels[id]}
              </Text>
            </Pressable>
          );
        })}
        <Text style={styles.note}>
          Puhelimen GPS: laita puhelin pyörän laukkuun tägin tilalle. Toimii vain, kun sovellus on auki.
          Lähteen vaihto poistaa valvonnan.
        </Text>
      </Card>

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
        <Row label="Akku" value={tag?.batteryPercent != null ? formatPercent(tag.batteryPercent) : '–'} />
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
  option: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#EAF2FE' },
});
