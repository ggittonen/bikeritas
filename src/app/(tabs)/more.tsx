import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { tagSourceLabels, type TagSourceId } from '@/services';
import { useBike } from '@/state/BikeContext';
import { colors, spacing } from '@/theme';

const sourceIds = Object.keys(tagSourceLabels) as TagSourceId[];

/** "Muut" tab: subscription and settings. */
export default function MoreScreen() {
  const { tagSource, setTagSource, subscriptionActive, setSubscription } = useBike();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card title="Bikeritas Turva">
        <AppText size={14} style={styles.body}>
          Kuukausitilaus aktivoi asiakaspalvelun: varkaustilanteessa se ilmoittaa poliisille, tekee
          rikos- ja vakuutusilmoituksen puolestasi ja välittää pyörän reaaliaikaisen sijainnin
          viranomaisille.
        </AppText>
        <View style={styles.switchRow}>
          <AppText upper bold color={subscriptionActive ? colors.success : colors.muted}>
            {subscriptionActive ? 'Tilaus aktiivinen' : 'Ei tilausta'}
          </AppText>
          <Switch
            value={subscriptionActive}
            onValueChange={setSubscription}
            trackColor={{ true: colors.success, false: colors.divider }}
          />
        </View>
        <AppText size={12} color={colors.muted}>
          Prototyyppi: maksua ei veloiteta, kytkin vain simuloi tilausta.
        </AppText>
      </Card>

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
              <AppText upper color={selected ? colors.text : colors.muted}>
                {selected ? '● ' : '○ '}
                {tagSourceLabels[id]}
              </AppText>
            </Pressable>
          );
        })}
        <AppText size={12} color={colors.muted}>
          Puhelimen GPS: laita puhelin pyörän laukkuun tägin tilalle. Toimii vain, kun sovellus on
          auki. Lähteen vaihto poistaa valvonnan.
        </AppText>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  body: { lineHeight: 21 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  option: { padding: spacing.md, borderWidth: 2, borderColor: colors.divider },
  optionSelected: { borderColor: colors.text },
});
